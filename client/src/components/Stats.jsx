import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import { useCountUp } from "../hooks/useCountUp";
import "./Stats.css";

function StatItem({ stat, active, index }) {
  const count = useCountUp(stat.value, active);
  const Icon = stat.icon;

  return (
    <div
      className={`stat-item ${active ? "is-in" : ""}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="stat-icon" aria-hidden="true">
        <Icon />
      </div>

      <div className="stat-content">
        <span className="stat-value">
          {count.toLocaleString("en-IN")}
          {stat.suffix && (
            <span className="stat-suffix">{stat.suffix}</span>
          )}
        </span>

        <span className="stat-label">{stat.label}</span>
      </div>
    </div>
  );
}

export default function Stats() {
  const [ref, visible] = useReveal(0.35);

  return (
    <section
      className="stats"
      ref={ref}
      aria-label="Quick Transolution statistics"
    >
      <div className="container stats-strip">
        {site.stats.map((stat, index) => (
          <StatItem
            key={stat.label}
            stat={stat}
            active={visible}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}