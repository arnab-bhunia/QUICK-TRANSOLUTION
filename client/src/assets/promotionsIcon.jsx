import { useId } from "react";

// Colors for every icon now live in WhyUs.css as CSS custom properties,
// scoped per icon via the wrapping class (.promo-icon--network, --shield,
// etc). Nothing here is hardcoded anymore — this file only defines shapes.
// Each icon still needs a unique gradient `id` per render (via useId)
// because the same icon renders twice on the page (desktop tab list +
// mobile accordion) at the same time; without a unique id, both copies
// would collide on one <linearGradient>.

export const NetworkIcon = () => {
  const uid = useId();
  const gradId = `networkGradient-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="promo-icon promo-icon--network"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" className="promo-icon-stop-start" />
          <stop offset="100%" className="promo-icon-stop-end" />
        </linearGradient>
      </defs>

      {/* Outer Network Ring */}
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 3"
      />

      {/* Connection Nodes */}
      <circle cx="32" cy="10" r="3" className="promo-icon-accent" />
      <circle cx="13" cy="23" r="3" className="promo-icon-accent" />
      <circle cx="18" cy="47" r="3" className="promo-icon-accent" />
      <circle cx="46" cy="48" r="3" className="promo-icon-accent" />
      <circle cx="52" cy="21" r="3" className="promo-icon-accent" />

      {/* Connecting Lines */}
      <path
        d="M32 10L52 21L46 48L18 47L13 23L32 10Z"
        stroke={`url(#${gradId})`}
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity=".55"
      />

      {/* India Silhouette */}
      <path
        d="M32 16
        L28 20
        L29 24
        L25 29
        L28 34
        L27 39
        L31 44
        L35 41
        L38 36
        L37 31
        L40 27
        L36 22
        L35 18
        Z"
        fill={`url(#${gradId})`}
      />

      {/* Location Pin */}
      <path
        d="M50 46
        C50 42.7 52.5 40 56 40
        C59.5 40 62 42.7 62 46
        C62 50.8 56 56 56 56
        C56 56 50 50.8 50 46Z"
        fill={`url(#${gradId})`}
      />
      <circle cx="56" cy="46" r="1.8" className="promo-icon-dot" />
    </svg>
  );
};

export const ShieldIcon = () => {
  const uid = useId();
  const gradId = `shieldGradient-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="promo-icon promo-icon--shield"
    >
      <defs>
        <linearGradient id={gradId} x1="10" y1="8" x2="54" y2="56">
          <stop offset="0%" className="promo-icon-stop-start" />
          <stop offset="100%" className="promo-icon-stop-end" />
        </linearGradient>
      </defs>

      <path
        d="M12 22L18 22"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />
      <path
        d="M46 22L52 22"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />

      {/* Shield */}
      <path
        d="M32 8
           L46 13
           V27
           C46 38 39.5 47 32 52
           C24.5 47 18 38 18 27
           V13
           L32 8Z"
        stroke={`url(#${gradId})`}
        strokeWidth="2.8"
        strokeLinejoin="round"
        className="promo-icon-fill-faint"
      />

      {/* Inner Shield */}
      <path
        d="M32 15
           L40 18
           V27
           C40 34 36 40 32 43
           C28 40 24 34 24 27
           V18
           L32 15Z"
        fill={`url(#${gradId})`}
        opacity=".18"
      />

      {/* Checkmark */}
      <path
        d="M27 29L31 33L38 25"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Glow Dot */}
      <circle
        cx="32"
        cy="56"
        r="2.2"
        fill={`url(#${gradId})`}
        opacity=".75"
      />
    </svg>
  );
};

export const TrackingIcon = () => {
  const uid = useId();
  const gradId = `trackingGradient-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="promo-icon promo-icon--tracking"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" className="promo-icon-stop-start" />
          <stop offset="100%" className="promo-icon-stop-end" />
        </linearGradient>
      </defs>

      {/* GPS Signal */}
      <path
        d="M18 12C14.5 15 13 19 13 23"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />
      <path
        d="M46 12C49.5 15 51 19 51 23"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".45"
      />

      {/* Location Pin */}
      <path
        d="M32 8
        C26.5 8 22 12.5 22 18
        C22 26.5 32 37 32 37
        C32 37 42 26.5 42 18
        C42 12.5 37.5 8 32 8Z"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        className="promo-icon-fill-faint"
        strokeLinejoin="round"
      />

      <circle cx="32" cy="18" r="3" fill={`url(#${gradId})`} />

      {/* Tracking Screen */}
      <rect
        x="17"
        y="39"
        width="30"
        height="14"
        rx="3"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
      />

      {/* Screen Stand */}
      <path
        d="M27 53H37"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M32 53V57"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M25 57H39"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Secure Check */}
      <circle
        cx="44"
        cy="44"
        r="5"
        className="promo-icon-dot"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
      />
      <path
        d="M42.2 44L43.8 45.6L46.8 42.6"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const PackageIcon = () => {
  const uid = useId();
  const gradId = `logisticsGradient-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="promo-icon promo-icon--package"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" className="promo-icon-stop-start" />
          <stop offset="100%" className="promo-icon-stop-end" />
        </linearGradient>
      </defs>

      {/* Warehouse Roof */}
      <path
        d="M14 24L32 12L50 24"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="14" cy="24" r="2.3" fill={`url(#${gradId})`} />
      <circle cx="50" cy="24" r="2.3" fill={`url(#${gradId})`} />
      <circle cx="32" cy="12" r="2.3" fill={`url(#${gradId})`} />

      {/* Open Package */}
      <path
        d="M22 26L32 21L42 26V40L32 45L22 40V26Z"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        strokeLinejoin="round"
        className="promo-icon-fill-faint"
      />

      {/* Left Flap */}
      <path
        d="M22 26L32 31L32 45"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Right Flap */}
      <path
        d="M42 26L32 31"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Center Fold */}
      <path
        d="M32 21V31"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Logistics Connection */}
      <path
        d="M14 24V50H50V24"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeDasharray="3 3"
        opacity=".45"
      />

      {/* Bottom Node */}
      <circle cx="32" cy="50" r="2.5" fill={`url(#${gradId})`} />
    </svg>
  );
};

export const DocumentIcon = () => {
  const uid = useId();
  const gradId = `docGradient-${uid}`;

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="promo-icon promo-icon--document"
    >
      <defs>
        <linearGradient id={gradId} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" className="promo-icon-stop-start" />
          <stop offset="100%" className="promo-icon-stop-end" />
        </linearGradient>
      </defs>

      {/* Clipboard Clip */}
      <rect x="26" y="8" width="12" height="6" rx="2" fill={`url(#${gradId})`} />

      {/* Clipboard */}
      <rect
        x="18"
        y="12"
        width="28"
        height="40"
        rx="5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        className="promo-icon-fill-faint"
      />

      {/* Document Header */}
      <path
        d="M24 21H40"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Checklist */}
      <circle cx="26" cy="29" r="1.8" fill={`url(#${gradId})`} />
      <path
        d="M30 29H39"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="26" cy="36" r="1.8" fill={`url(#${gradId})`} />
      <path
        d="M30 36H39"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Approval Seal */}
      <circle
        cx="47"
        cy="46"
        r="7"
        className="promo-icon-dot"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
      />
      <path
        d="M44.5 46L46.5 48L50 44.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative Spark */}
      <path
        d="M49 13V17"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M47 15H51"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  );
};