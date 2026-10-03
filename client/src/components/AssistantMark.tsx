import { forwardRef, useId } from 'react';

export interface AssistantMarkProps {
  /** Rendered size in px (recognizable down to ~20px) */
  size?: number;
  /** Eye mid-blink (scaleY collapse) */
  blinking?: boolean;
  /** 0..1 — how present the amber orbit accent is */
  attention?: number;
  /** Degrees — orbital arc position, shifts while "looking" */
  orbitRotate?: number;
  /** Degrees — orbital amber point position along the arc */
  dotRotate?: number;
  /** Static eye offset for showcase/spec renderings */
  eyeOffset?: { x: number; y: number };
  className?: string;
}

/**
 * V2 — the abstract assistant mark: a softly dimensional deep-olive
 * chat-emoticon silhouette with a recessed forest-ink eye, a warm amber
 * focal point, a sage inner rim and a partial amber orbital arc carrying
 * a tiny travelling point. Not a face, not an icon — a presence.
 *
 * Palette: sage #8CA37A · olive #556B4F · forest #193B34
 *          amber #F2B04C · cream #FAF7EF
 */
export const AssistantMark = forwardRef<SVGGElement, AssistantMarkProps>(
  function AssistantMark(
    {
      size = 56,
      blinking = false,
      attention = 0.55,
      orbitRotate = 0,
      dotRotate = -58,
      eyeOffset,
      className,
    },
    eyeTrackRef
  ) {
    const uid = useId();
    const bodyId = `qt-body-${uid}`;
    const eyeId = `qt-eye-${uid}`;
    const coreId = `qt-core-${uid}`;
    const hlId = `qt-hl-${uid}`;

    return (
      <svg
        className={`qt-launcher__mark${blinking ? ' qt-mark--blinking' : ''}${
          className ? ` ${className}` : ''
        }`}
        width={size}
        height={size}
        viewBox="0 0 56 56"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* body: sage-lit upper left → deep olive → forest ink */}
          <radialGradient id={bodyId} cx="36%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#7d9168" />
            <stop offset="46%" stopColor="#556b4f" />
            <stop offset="100%" stopColor="#193b34" />
          </radialGradient>
          {/* recessed eye: darkest at the core */}
          <radialGradient id={eyeId} cx="46%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#0e241f" />
            <stop offset="72%" stopColor="#193b34" />
            <stop offset="100%" stopColor="#22473e" />
          </radialGradient>
          {/* amber focal point */}
          <radialGradient id={coreId} cx="40%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#f9d48c" />
            <stop offset="55%" stopColor="#f2b04c" />
            <stop offset="100%" stopColor="#d6932e" />
          </radialGradient>
          {/* soft upper-left highlight */}
          <radialGradient id={hlId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* body — rounded, slightly asymmetric chat silhouette with a quiet tail */}
        <path
          d="M28 4.5
             C 40.5 4.5, 50.5 14.3, 50.5 27
             C 50.5 32.8, 48.7 38.2, 45.2 42.4
             L 49.4 48.4
             C 50.1 49.4, 49.1 50.4, 47.9 50
             L 41.6 47.7
             C 37.6 50.6, 32.9 52.3, 27.8 52.3
             C 15.4 52.3, 5.5 42.2, 5.5 28.4
             C 5.5 15.3, 15.4 4.5, 28 4.5
             Z"
          fill={`url(#${bodyId})`}
        />

        {/* fine, restrained inner rim */}
        <path
          d="M28 4.5
             C 40.5 4.5, 50.5 14.3, 50.5 27
             C 50.5 32.8, 48.7 38.2, 45.2 42.4
             L 49.4 48.4
             C 50.1 49.4, 49.1 50.4, 47.9 50
             L 41.6 47.7
             C 37.6 50.6, 32.9 52.3, 27.8 52.3
             C 15.4 52.3, 5.5 42.2, 5.5 28.4
             C 5.5 15.3, 15.4 4.5, 28 4.5
             Z"
          fill="none"
          stroke="rgba(250,247,239,0.16)"
          strokeWidth="1"
          transform="translate(28 28.4) scale(0.9) translate(-28 -28.4)"
        />

        {/* soft dimensional highlight, upper left */}
        <ellipse
          cx="20"
          cy="14.5"
          rx="12.5"
          ry="7"
          fill={`url(#${hlId})`}
          transform="rotate(-20 20 14.5)"
        />

        {/* amber orbital arc — partial, thin, elegant */}
        <g
          className="qt-mark__orbit"
          style={{
            opacity: 0.4 + attention * 0.55,
            transform: `rotate(${orbitRotate}deg)`,
          }}
        >
          <circle
            cx="28"
            cy="28.4"
            r="18.5"
            fill="none"
            stroke="#f2b04c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="21.5 94.7"
            transform="rotate(-62 28 28.4)"
          />
        </g>

        {/* tiny amber point that occasionally travels a short section of the arc */}
        <g
          className="qt-mark__orbit-dot"
          style={{ transform: `rotate(${dotRotate}deg)` }}
        >
          <circle cx="28" cy="9.9" r="1.7" fill="#f2b04c" opacity="0.95" />
          <circle cx="28" cy="9.9" r="3.2" fill="#f2b04c" opacity="0.14" />
        </g>

        {/* focal element — translate (look) and blink are independent layers */}
        <g
          className="qt-mark__eye-track"
          ref={eyeTrackRef}
          style={
            eyeOffset
              ? { transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }
              : undefined
          }
        >
          <g className="qt-mark__eye-blink">
            {/* recessed eye with sage inner rim */}
            <circle
              cx="28"
              cy="28.4"
              r="9.6"
              fill={`url(#${eyeId})`}
              stroke="rgba(140,163,122,0.5)"
              strokeWidth="1"
            />
            <circle cx="28" cy="28.4" r="3.2" fill={`url(#${coreId})`} />
            <circle cx="25.5" cy="25.7" r="1.15" fill="#ffffff" opacity="0.92" />
          </g>
        </g>
      </svg>
    );
  }
);
