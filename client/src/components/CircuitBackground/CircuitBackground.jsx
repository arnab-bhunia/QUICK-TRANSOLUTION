import { useEffect, useMemo, useRef, useState } from "react";
import "./CircuitBackground.css";
import GraphGenerator from "./engine/GraphGenerator";
import CircuitEngine from "./engine/CircuitEngine";

const GRID_SPACING = 52;

export default function CircuitBackground() {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const engineRef = useRef(null);

  const [size, setSize] = useState({
    width: 1200,
    height: 300,
  });

  // Observe container resize
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

  // Build graph only when size changes
  const graph = useMemo(() => {
    const generator = new GraphGenerator({
      width: size.width,
      height: size.height,
      spacing: GRID_SPACING,
    });

    return generator.generate();
  }, [size]);

  // Create / destroy engine
  useEffect(() => {
    if (!svgRef.current) return;

    if (engineRef.current) {
      engineRef.current.destroy();
    }

    engineRef.current = new CircuitEngine({
      svg: svgRef.current,
      graph,
    });

    engineRef.current.start();

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [graph]);

  return (
    <div
      ref={wrapperRef}
      className="circuit-background"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        className="circuit-svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      />
    </div>
  );
}