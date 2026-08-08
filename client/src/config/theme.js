// ============================================================================
// THEME CONFIG
// Change every color / font here and the entire site updates.
// Nothing else in the codebase should hard-code a hex value or font name.
// ============================================================================

export const theme = {
  colors: {
    // Core brand
    primary: "#0B3B60",       // deep freight-navy — headers, nav, primary buttons
    primaryDark: "#082A47",   // hover / pressed states, footer base
    primaryLight: "#2C5F87",  // secondary text on navy, subtle borders
    highlight: "#F2C14E",     // warm yellow — the outline/secondary button's own color
    highlightDark: "#D9A72E", // hover/pressed state for the highlight button

    // Accent (route / signal colors — used sparingly, for the one signature moment)
    accent: "#F2A93B",        // amber — route line, highlights, active tab
    accentDark: "#D98F1F",
    signal: "#D6482B",        // brick-red — CTA buttons, urgent actions only
    signalDark: "#C23E24",
    // Neutrals
    // bg: "#F4F6F5",            // page background (cool paper, not warm cream)
    bg: "#fafafa",
    bgAlt: "#FFFFFF",         // card surfaces
    bgInk: "#0A1F2E",         // near-black section backgrounds (footer, stats)
    line: "#DDE3E1",          // hairline borders / dividers
    ink: "#132B3A",           // primary text
    inkSoft: "#4B6272",       // secondary text
    inkFaint: "#8299A6",      // captions, placeholders

    white: "#FFFFFF",
  },

  fonts: {
    display: "'Barlow Condensed', sans-serif", // headlines — road-sign character
    body: "'Inter', sans-serif",               // paragraphs, UI
    mono: "'IBM Plex Mono', monospace",        // stats, tracking numbers, labels
    box: "'Space Mono', sans-serif",
  },

  radius: {
    sm: "4px",
    md: "8px",
    lg: "16px",
  },

  shadow: {
    card: "0 2px 16px rgba(11, 59, 96, 0.08)",
    lifted: "0 12px 32px rgba(11, 59, 96, 0.16)",
  },
};

// Injects the palette as CSS custom properties so plain CSS files can
// consume `var(--color-primary)` etc. without importing JS.
export function applyTheme() {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${kebab(key)}`, value);
  });
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${kebab(key)}`, value);
  });
  Object.entries(theme.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${kebab(key)}`, value);
  });
  Object.entries(theme.shadow).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${kebab(key)}`, value);
  });
}

function kebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
