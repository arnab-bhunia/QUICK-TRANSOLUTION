import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { AssistantMark } from './AssistantMark';
import "./ChatbotLauncher.css";

export interface ChatbotLauncherProps {
  /** Called after the tactile press completes — connect the real chatbot here */
  onOpen?: () => void;
  /** Future-ready: contextual helper lines supplied programmatically */
  helperMessages?: string[];
  /** Master switch for the helper-message feature (default: true) */
  showHelperMessage?: boolean;
  /** Ms before the first helper message may appear (default: 15000) */
  helperDelay?: number;
  /** Accessible label override */
  ariaLabel?: string;
  /** Inline position override if the host page needs it */
  style?: CSSProperties;
}

const DEFAULT_MESSAGES = [
  "I'm your helper — need anything?",
  'Looking for something?',
  'I can help you find the right service.',
  'Need help with your shipment?',
];

const AWARE_RADIUS = 240; // px — the cursor becomes "nearby"
const EYE_TRAVEL = 2.4; // px — max focal drift
const rand = (min: number, max: number) => min + Math.random() * (max - min);

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * A small living assistant presence for Quick Transolution.
 *
 * Behaviour architecture:
 *  - CSS owns the ambient layer only (7.5s breathing, hover lift, press).
 *  - JS owns every *occasional* behaviour — blink, subtle look, helper
 *    message — on irregular timers so it never reads as a loop.
 *  - Cursor awareness is imperative (refs + rAF): zero re-renders per frame.
 *  - All timers are tracked and cleared on unmount.
 */
export function ChatbotLauncher({
  onOpen,
  helperMessages = DEFAULT_MESSAGES,
  showHelperMessage = true,
  helperDelay = 15000,
  ariaLabel = 'Open virtual assistant',
  style,
}: ChatbotLauncherProps) {
  const reduced = usePrefersReducedMotion();

  const rootRef = useRef<HTMLButtonElement>(null);
  const eyeRef = useRef<SVGGElement>(null);
  const leanRef = useRef<HTMLSpanElement>(null);

  const timersRef = useRef<number[]>([]);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: 0, y: 0, near: false, pull: 0 });
  const idleLookRef = useRef({ x: 0, y: 0 });
  const dotAngleRef = useRef(-58);
  const lastMsgRef = useRef(-1);

  const [blinking, setBlinking] = useState(false);
  const [helper, setHelper] = useState<string | null>(null);
  const [helperShown, setHelperShown] = useState(false);

  /* ---- timer bookkeeping -------------------------------------- */
  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(rafRef.current);
    },
    []
  );

  /* ---- imperative motion: apply eye drift + body lean ---------- */
  const applyPresence = useCallback(() => {
    rafRef.current = 0;
    const root = rootRef.current;
    const eye = eyeRef.current;
    if (!root || !eye) return;

    let tx = idleLookRef.current.x;
    let ty = idleLookRef.current.y;
    let pull = 0;

    if (cursorRef.current.near) {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cursorRef.current.x - cx;
      const dy = cursorRef.current.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // attention fades in with proximity — a glance, never a chase
      pull = 1 - Math.min(1, dist / AWARE_RADIUS);
      const travel = (1 - pull) * EYE_TRAVEL;
      tx = (dx / dist) * travel;
      ty = (dy / dist) * travel;
    }

    eye.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;

    // attention state: amber orbit warms as the visitor comes closer
    const orbit = root.querySelector<SVGGElement>('.qt-mark__orbit');
    if (orbit) {
      orbit.style.transform = `rotate(${(tx * 4).toFixed(2)}deg)`;
      orbit.style.opacity = (0.45 + pull * 0.55).toFixed(2);
    }

    const lean = leanRef.current;
    if (lean && cursorRef.current.near) {
      lean.style.transform = `translate(${(tx * 0.45).toFixed(2)}px, ${(
        ty * 0.45
      ).toFixed(2)}px) rotate(${(tx * 0.6).toFixed(2)}deg)`;
    } else if (lean) {
      lean.style.transform = '';
    }
  }, []);

  const schedulePresence = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(applyPresence);
  }, [applyPresence]);

  /* ---- cursor awareness ---------------------------------------- */
  useEffect(() => {
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      cursorRef.current = {
        x: e.clientX,
        y: e.clientY,
        near: dist < AWARE_RADIUS,
        pull: 0,
      };
      schedulePresence();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [reduced, schedulePresence]);

  /* ---- the living loop: rest → look → settle → blink → rest ---- */
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;

    const blink = () => {
      setBlinking(true);
      later(() => {
        setBlinking(false);
        // occasionally a natural double-blink
        if (Math.random() < 0.2) {
          later(() => {
            setBlinking(true);
            later(() => setBlinking(false), 170);
          }, 260);
        }
      }, 190);
    };

    const look = () => {
      if (cursorRef.current.near) return; // cursor already has its attention
      const angle = Math.random() * Math.PI * 2;
      const mag = rand(0.8, 1.7);
      idleLookRef.current = { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
      schedulePresence();
      later(() => {
        idleLookRef.current = { x: 0, y: 0 };
        schedulePresence();
      }, rand(900, 1700));
    };

    // the tiny amber point drifts a short section of the arc, then rests
    const orbitDot = () => {
      const dot = rootRef.current?.querySelector<SVGGElement>(
        '.qt-mark__orbit-dot'
      );
      if (!dot) return;
      dotAngleRef.current += rand(22, 38);
      dot.style.transform = `rotate(${dotAngleRef.current.toFixed(1)}deg)`;
      later(() => {
        dotAngleRef.current -= rand(10, 20);
        dot.style.transform = `rotate(${dotAngleRef.current.toFixed(1)}deg)`;
      }, rand(1600, 2400));
    };

    const tick = () => {
      if (cancelled) return;
      if (!document.hidden) {
        const roll = Math.random();
        if (roll < 0.42) blink();
        else if (roll < 0.68) look();
        else if (roll < 0.84) orbitDot();
        else {
          blink();
          later(look, 420);
        }
      }
      later(tick, rand(4500, 9500)); // long, irregular pauses
    };

    later(tick, rand(2800, 5200)); // first sign of life
    return () => {
      cancelled = true;
    };
  }, [reduced, later, schedulePresence]);

  /* ---- occasional helper message — a gentle invitation --------- */
  const messagesKey = helperMessages.join('\n');
  useEffect(() => {
    if (!showHelperMessage || helperMessages.length === 0) return;
    let cancelled = false;

    const cycle = (delay: number) =>
      later(() => {
        if (cancelled || document.hidden) {
          if (!cancelled) cycle(30000);
          return;
        }
        let i = Math.floor(Math.random() * helperMessages.length);
        if (helperMessages.length > 1 && i === lastMsgRef.current) {
          i = (i + 1) % helperMessages.length;
        }
        lastMsgRef.current = i;
        setHelper(helperMessages[i]);
        requestAnimationFrame(() => setHelperShown(true));
        later(() => setHelperShown(false), 5200);
        later(() => setHelper(null), 5600);
        cycle(rand(65000, 110000)); // rare, contextual, never nagging
      }, delay);

    cycle(helperDelay + rand(0, 5000));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHelperMessage, messagesKey, helperDelay, later]);

  /* ---- press → open -------------------------------------------- */
  const handleClick = useCallback(() => {
    onOpen?.();
  }, [onOpen]);

  return (
    <>
      {helper !== null && (
        <div
          className={`qt-helper${helperShown ? ' qt-helper--visible' : ''}`}
          role="status"
          aria-live="polite"
        >
          {helper}
        </div>
      )}

      <button
        ref={rootRef}
        type="button"
        className={`qt-launcher${blinking ? ' is-blinking' : ''}`}
        aria-label={ariaLabel}
        onClick={handleClick}
        style={style}
      >
        <span className="qt-launcher__aura" aria-hidden="true" />
        <span className="qt-launcher__float">
          <span className="qt-launcher__tilt">
            <span ref={leanRef} className="qt-launcher__lean">
              <AssistantMark ref={eyeRef} />
            </span>
          </span>
        </span>
      </button>
    </>
  );
}

export default ChatbotLauncher;
