import { useEffect, useState } from "react";
import "./StickyEnquireBar.css";

/*
 * position: fixed keeps this pinned to the viewport while scrolling, same
 * as StickyContact. The one thing fixed positioning can't do on its own is
 * stop before it reaches the footer — a fixed element floats over
 * everything below it, footer included.
 *
 * Fix: watch the footer with an IntersectionObserver. The moment any part
 * of the footer scrolls into view, switch this button from
 * `position: fixed` to `position: absolute` (see .is-docked in the CSS).
 * With no positioned ancestor, an absolutely positioned element's
 * containing block is the whole document — so `bottom: <footerHeight +
 * margin>` reliably parks it just above the footer's top edge, scrolling
 * normally with the page from then on instead of floating over it.
 */
export default function StickyEnquireBar({ label = "Enquire Now", onOpen }) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--footer-height",
        `${footer.offsetHeight}px`
      );
    };
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(footer);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setDocked(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );
    intersectionObserver.observe(footer);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      className={`enquire-sticky ${docked ? "is-docked" : ""}`}
      onClick={onOpen}
    >
      <span className="enquire-sticky-dot" aria-hidden="true" />
      {label}
    </button>
  );
}
