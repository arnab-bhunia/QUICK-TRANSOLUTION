import { useEffect, useRef } from "react";

// Measures the wrapped element's real rendered height (which changes
// e.g. when TopBar wraps to two lines on narrow screens) and writes it
// into a CSS custom property on the document root. Anything in CSS can
// then read `var(--header-height)` to size itself against "whatever
// space the sticky header actually takes up right now" instead of a
// guessed fixed pixel value.
export function useMeasuredHeight(cssVarName) {
  const ref = useRef(null);

  useEffect(() => {
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

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cssVarName]);

  return ref;
}