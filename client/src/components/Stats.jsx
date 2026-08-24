import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import { useCountUp } from "../hooks/useCountUp";
import "./Stats.css";
import CircuitBackground from "../components/CircuitBackground/CircuitBackground";

function StatItem({ stat, active, index }) {
  const count = useCountUp(stat.value, active);
  const Icon = stat.icon;

  return (
    <div
      className={`stat-item ${active ? "is-in" : ""}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="stat-icon">
        <Icon />
      </div>

      <div className="stat-content">
        <span className="stat-value">
          {count.toLocaleString("en-IN")}
          <span className="stat-suffix">{stat.suffix}</span>
        </span>

        <span className="stat-label">
          {stat.label}
        </span>
      </div>
    </div>
  );
}

export default function Stats() {
  const [ref, visible] = useReveal(0.4);

  return (
    <section className="stats" ref={ref}>

      {/* <CircuitBackground /> */}
      <div className="stats-grid-bg" aria-hidden="true" />

      <div className="container stats-strip">
        {site.stats.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} active={visible} index={i} />
        ))}
      </div>
    </section>
  );
}
