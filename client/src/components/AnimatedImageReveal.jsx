import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import "./AnimatedImageReveal.css";

export default function AnimatedImageReveal({
  src,
  alt = "",
  className = "",
  desktopStrips = 12,
  mobileStrips = 8,
  duration = 0.85,
  stagger = 0.060,
  delay = 0.15,
}) {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    let resizeTimer;

    const ctx = gsap.context(() => {
      const banner = root.parentElement;

      if (!banner) return;

      let hasPlayed = false;

      function getCoverGeometry(
        boxWidth,
        boxHeight,
        imageWidth,
        imageHeight
      ) {
        const scale = Math.max(
          boxWidth / imageWidth,
          boxHeight / imageHeight
        );

        const coverWidth = imageWidth * scale;
        const coverHeight = imageHeight * scale;

        return {
          width: coverWidth,
          height: coverHeight,
          offsetX: (boxWidth - coverWidth) / 2,
          offsetY: (boxHeight - coverHeight) / 2,
        };
      }

      function buildSlices(geometry, count) {
        root.innerHTML = "";

        const fragment =
          document.createDocumentFragment();

        const sliceWidth =
          geometry.width / count;

        for (let index = 0; index < count; index += 1) {
          const slice =
            document.createElement("div");

          slice.className =
            "animated-image-reveal__slice";

          const isLast =
            index === count - 1;

          slice.style.left =
            `${index * sliceWidth}px`;

          slice.style.width =
            `${sliceWidth + (isLast ? 0 : 1)}px`;

          const plate =
            document.createElement("div");

          plate.className =
            "animated-image-reveal__plate";

          plate.style.width =
            `${geometry.width}px`;

          plate.style.height =
            `${geometry.height}px`;

          plate.style.left =
            `${geometry.offsetX - index * sliceWidth}px`;

          plate.style.top =
            `${geometry.offsetY}px`;

          plate.style.backgroundImage =
            `url("${src}")`;

          plate.style.backgroundSize =
            `${geometry.width}px ${geometry.height}px`;

          plate.style.backgroundPosition =
            "0 0";

          plate.style.backgroundRepeat =
            "no-repeat";

          slice.appendChild(plate);
          fragment.appendChild(slice);
        }

        root.appendChild(fragment);

        return root.querySelectorAll(
          ".animated-image-reveal__slice"
        );
      }
      const preload = new Image();

      preload.onload = () => {
        requestAnimationFrame(init);
      };

      preload.onerror = () => {
    
        root.innerHTML = "";
      };

      preload.src = src;


      function init() {
        if (!preload.naturalWidth) return;

        const rect =
          banner.getBoundingClientRect();

        const boxWidth = rect.width;
        const boxHeight = rect.height;

        const geometry =
          getCoverGeometry(
            boxWidth,
            boxHeight,
            preload.naturalWidth,
            preload.naturalHeight
          );

        const isMobile =
          window.matchMedia(
            "(max-width: 768px)"
          ).matches;

        const count = isMobile
          ? mobileStrips
          : desktopStrips;

        if (
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
        ) {
          root.innerHTML = "";

          const plate =
            document.createElement("div");

          plate.className =
            "animated-image-reveal__static";

          plate.style.left =
            `${geometry.offsetX}px`;

          plate.style.top =
            `${geometry.offsetY}px`;

          plate.style.width =
            `${geometry.width}px`;

          plate.style.height =
            `${geometry.height}px`;

          plate.style.backgroundImage =
            `url("${src}")`;

          plate.style.backgroundSize =
            `${geometry.width}px ${geometry.height}px`;

          root.appendChild(plate);

          return;
        }

        const slices =
          buildSlices(geometry, count);

        if (hasPlayed) {
          gsap.set(slices, {
            y: 0,
          });

          return;
        }

        hasPlayed = true;

        gsap.set(slices, {
          y: "-100%",
        });

        gsap.to(slices, {
          y: 0,

          duration,

          ease: "power3.out",

          stagger,

          delay,

          overwrite: true,
        });
      }

      /*
       * ---------------------------------------------------------
       * RESIZE
       * ---------------------------------------------------------
       */
      const handleResize = () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
          if (preload.naturalWidth) {
            init();
          }
        }, 180);
      };

      window.addEventListener(
        "resize",
        handleResize
      );

      /*
       * Cleanup
       */
      return () => {
        clearTimeout(resizeTimer);

        window.removeEventListener(
          "resize",
          handleResize
        );
      };
    }, root);

    return () => {
      clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [
    src,
    desktopStrips,
    mobileStrips,
    duration,
    stagger,
    delay,
  ]);

  return (
    <div
      ref={rootRef}
      className={`animated-image-reveal ${className}`.trim()}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
    />
  );
}