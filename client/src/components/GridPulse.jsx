import { useEffect, useMemo, useRef, useState } from "react";
import "./GridPulse.css";
import { buildGraph, createRandomPath } from "../utils/graph";
import usePulseEngine from "../hooks/usePulseEngine";

const SPACING = 52;
const DIAGONAL_CHANCE = 0.35;


export default function GridPulse() {
  const wrapperRef = useRef(null);
  const [size, setSize] = useState({
    width: 1200,
    height: 300,
  });

  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setSize({
        width,
        height,
      });
    });

    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, []);

  const graph = useMemo(() => {
    const cols = Math.ceil(size.width / SPACING) + 2;
    const rows = Math.ceil(size.height / SPACING) + 2;

    const nodes = [];
    const edges = [];

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        nodes.push({
          id: `${x}-${y}`,
          x: x * SPACING,
          y: y * SPACING,
        });
      }
    }

    const index = (x, y) => y * cols + x;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const current = nodes[index(x, y)];

        if (x < cols - 1) {
          edges.push({
            from: current,
            to: nodes[index(x + 1, y)],
          });
        }

        if (y < rows - 1) {
          edges.push({
            from: current,
            to: nodes[index(x, y + 1)],
          });
        }

        if (
          x < cols - 1 &&
          y < rows - 1 &&
          Math.random() < DIAGONAL_CHANCE
        ) {
          edges.push({
            from: current,
            to: nodes[index(x + 1, y + 1)],
          });
        }

        if (
          x > 0 &&
          y < rows - 1 &&
          Math.random() < DIAGONAL_CHANCE
        ) {
          edges.push({
            from: current,
            to: nodes[index(x - 1, y + 1)],
          });
        }
      }
    }

    const graphMap = buildGraph(nodes, edges);

const previewPath = createRandomPath(graphMap);

return {
  nodes,
  edges,
  graphMap,
  previewPath,
};
  }, [size]);

const {
    pulse,
    trail
} = usePulseEngine(graph);

  return (
    <div
      ref={wrapperRef}
      className="grid-pulse"
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter
    id="gridGlow"
    x="-300%"
    y="-300%"
    width="600%"
    height="600%"
>
            <feGaussianBlur
              stdDeviation="2"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="grid-lines">
          {graph.edges.map((edge, i) => (
            <line
              key={i}
              x1={edge.from.x}
              y1={edge.from.y}
              x2={edge.to.x}
              y2={edge.to.y}
            />
          ))}
        </g>

        <g className="grid-nodes">
          {graph.nodes.map((node) => (
            <circle
    key={node.id}
    cx={node.x}
    cy={node.y}
    r="1.5"
    className={
        pulse &&
        Math.abs(node.x - pulse.x) < 2 &&
        Math.abs(node.y - pulse.y) < 2
            ? "grid-node active"
            : "grid-node"
    }
/>
          ))}
        </g>

<g className="pulse-layer" filter="url(#gridGlow)">
  {/* Trail */}
  {trail.map((point, i) => (
    <circle
      key={i}
      cx={point.x}
      cy={point.y}
      r={Math.max(0.8, point.size)}
      className="trail-dot"
      opacity={point.opacity}
    />
  ))}

  {/* Pulse */}
  {pulse && (
    <>
      {/* Large halo */}
      <circle
        cx={pulse.x}
        cy={pulse.y}
        r="2"
        className="pulse-halo"
      />

      {/* Orange glow */}
      <circle
        cx={pulse.x}
        cy={pulse.y}
        r="1.5"
        className="pulse-glow"
      />

      {/* White hot core */}
      <circle
        cx={pulse.x}
        cy={pulse.y}
        r="1"
        className="pulse-core"
      />
    </>
  )}
</g>

      </svg>
    </div>
  );
}