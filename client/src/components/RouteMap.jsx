import { site } from "../config/site";
import "./RouteMap.css";

// The signature visual: a schematic route network connecting the regions
// Sugam serves. Lines draw themselves in on load, then a light pulse
// travels the network on loop, echoing the live shipment tracking the
// business is built on.
const EDGES = [
  ["delhi", "kolkata"],
  ["kolkata", "guwahati"],
  ["guwahati", "dhaka"],
  ["kolkata", "dhaka"],
  ["delhi", "kathmandu"],
  ["kathmandu", "guwahati"],
  ["guwahati", "thimphu"],
];

export default function RouteMap({ active }) {
  const nodes = site.hero.routeNodes;
  const find = (id) => nodes.find((n) => n.id === id);

  return (
    <svg
      className={`route-map ${active ? "is-active" : ""}`}
      viewBox="0 0 520 320"
      role="img"
      aria-label="Route network across India, Nepal, Bhutan and Bangladesh"
    >
      <defs>
        <radialGradient id="rm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="260" cy="170" r="180" fill="url(#rm-glow)" opacity="0.5" />

      {EDGES.map(([a, b], i) => {
        const n1 = find(a);
        const n2 = find(b);
        return (
          <line
            key={`${a}-${b}`}
            className="route-edge"
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            style={{ transitionDelay: `${220 + i * 130}ms` }}
          />
        );
      })}

      {EDGES.map(([a, b], i) => {
        const n1 = find(a);
        const n2 = find(b);
        return (
          <circle
            key={`pulse-${a}-${b}`}
            className="route-pulse"
            r="3.2"
            style={{ animationDelay: `${1.4 + i * 0.5}s` }}
          >
            <animateMotion
              dur="3.2s"
              repeatCount="indefinite"
              begin={`${1.4 + i * 0.5}s`}
              path={`M${n1.x},${n1.y} L${n2.x},${n2.y}`}
            />
          </circle>
        );
      })}

      {nodes.map((n, i) => (
        <g
          key={n.id}
          className="route-node"
          style={{ transitionDelay: `${140 + i * 90}ms` }}
        >
          <circle cx={n.x} cy={n.y} r="5" className="route-node-dot" />
          <circle cx={n.x} cy={n.y} r="10" className="route-node-ring" />
          <text x={n.x} y={n.y - 16} className="route-node-label" textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
