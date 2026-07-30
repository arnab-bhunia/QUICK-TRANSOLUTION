import { useLayoutEffect, useRef } from "react";

// Measures the wrapped element's real rendered height (which changes
// e.g. when TopBar wraps to two lines on narrow screens) and writes it
// into a CSS custom property on the document root. Anything in CSS can
// then read `var(--header-height)` to size itself against "whatever
// space the sticky header actually takes up right now" instead of a
// guessed fixed pixel value.
//
// NOTE: this used to run in useEffect, which fires *after* the browser
// paints. The hero's height is `calc(100vh - var(--header-height))`, so
// the very first paint used the CSS fallback value, then a moment later
// snapped to the real measured value — a visible layout jump right as the
// page became interactive (worst right when someone starts scrolling
// immediately after load). useLayoutEffect runs synchronously before the
// browser paints, so the correct height is applied before anything is
// ever shown. We also re-measure once webfonts finish loading, since a
// font swap can change text height/wrapping after the initial measurement.
export function useMeasuredHeight(cssVarName) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      document.documentElement.style.setProperty(
        cssVarName,
        `${node.offsetHeight}px`
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(update);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cssVarName]);

  return ref;
}