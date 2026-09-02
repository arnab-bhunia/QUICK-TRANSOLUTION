// Minimal line-icon set for the admin sidebar. Single stroke style,
// 20x20 viewBox, currentColor — deliberately no icon library dependency
// since none was already in this project.
const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function ShipmentsIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2.5 17 6v8l-7 3.5L3 14V6l7-3.5Z" />
      <path d="M3 6l7 3.5L17 6" />
      <path d="M10 9.5V17" />
    </svg>
  );
}

export function BookingsIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14" />
      <path d="M7 2.3v3.4M13 2.3v3.4" />
      <path d="m7 12 2 2 4-4" />
    </svg>
  );
}

export function TeamIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="7.2" cy="7" r="2.6" />
      <path d="M2.5 16.2c.5-2.7 2.3-4.2 4.7-4.2s4.2 1.5 4.7 4.2" />
      <circle cx="14.3" cy="6.3" r="2.1" />
      <path d="M12.9 11.8c1.9.2 3.3 1.6 3.7 3.9" />
    </svg>
  );
}

export function AnalyticsIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 17V3" />
      <path d="M3 17h14" />
      <rect x="5.5" y="10" width="2.4" height="5" />
      <rect x="9.8" y="6.5" width="2.4" height="8.5" />
      <rect x="14.1" y="8.5" width="2.4" height="6.5" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

// Points right by default; callers rotate it via inline style/CSS class
// for the other directions (collapse toggle, sub-nav expand indicator).
export function ChevronIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7.5 4.5 13 10l-5.5 5.5" />
    </svg>
  );
}
