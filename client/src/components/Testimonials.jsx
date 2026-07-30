import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./Testimonials.css";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [headRef, headVisible] = useReveal(0.4);
  const timerRef = useRef(null);
  const count = site.testimonials.length;

  const go = useCallback(
    (next) => setIndex((i) => (next + count) % count),
    [count]
  );

  useEffect(() => {
    timerRef.current = setInterval(() => go(index + 1), 6000);
    return () => clearInterval(timerRef.current);
  }, [index, go]);

  return (
    <section id="clients" className="section testimonials">
      <div className="container">
        <div className={`section-head ${headVisible ? "is-in" : ""}`} ref={headRef}>
          <span className="eyebrow">Our Clients</span>
          <h2>Satisfied clients are our greatest reward</h2>
        </div>

        <div className="testimonial-stage">
          <div
            className="testimonial-track"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {site.testimonials.map((t) => (
              <figure className="testimonial-slide" key={t.name}>
                <span className="decoration-dots decoration-dots--tl" aria-hidden="true" />
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                 <div className="mini-line"></div>
                <figcaption>
    <div className="testimonial-person">

      <img
        src={t.image}
        alt={t.name}
        className="testimonial-avatar"
      />

      <div className="testimonial-info">

        <h3>{t.name}</h3>

        <span className="testimonial-role">
          {t.role}
        </span>
        <strong>{t.company}</strong>
        <div className="testimonial-stars">
          ★★★★★
        </div>

      </div>

    </div>

    {/* <div className="testimonial-company">
      <img src={t.logo} alt={t.company} />
    </div> */}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="testimonial-controls">
            <button
              className="testimonial-arrow"
              onClick={() => go(index - 1)}
              aria-label="Previous testimonial"
            >
              &larr;
            </button>
            <div className="testimonial-dots">
              {site.testimonials.map((t, i) => (
                <button
                  key={t.name}
                  className={`testimonial-dot ${i === index ? "is-active" : ""}`}
                  onClick={() => go(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              className="testimonial-arrow"
              onClick={() => go(index + 1)}
              aria-label="Next testimonial"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
