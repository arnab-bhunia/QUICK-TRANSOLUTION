// import { site } from "../config/site";
// import { useReveal } from "../hooks/useReveal";
// import "./Services.css";

// function ServiceCard({ service, index }) {
//   const [ref, visible] = useReveal(0.15);
//   return (
//     <article
//       ref={ref}
//       className={`service-card ${visible ? "is-in" : ""}`}
//       style={{ transitionDelay: `${(index % 3) * 90}ms` }}
//     >
//       <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
//       <h3>{service.title}</h3>
//       <p>{service.summary}</p>
//       <a href="#contact" className="service-link">
//         Read more <span aria-hidden="true">&rarr;</span>
//       </a>
//     </article>
//   );
// }

// export default function Services() {
//   const [headRef, headVisible] = useReveal(0.4);

//   return (
//     <section id="services" className="services">
//       <div className="services-banner">
//         <div className="container">
//           <div
//             ref={headRef}
//             className={`services-banner-head ${headVisible ? "is-in" : ""}`}
//           >

// <span className="services-tag">
//   <span className="services-tag-line" aria-hidden="true" />
//   Our Services
//   <span className="services-tag-line" aria-hidden="true" />
// </span>
// <h2 className="services-big-heading">
//   <span className="shb-line shb-bold">One Stop Solution</span>
//   <span className="shb-line shb-thin">For Every</span>
//   <span className="shb-line shb-bold">
//     Transportation <span className="shb-highlight">Need</span>
//   </span>
// </h2>
// <span className="services-badge-icon" aria-hidden="true">
//   <svg
//   viewBox="0 0 24 24"
//   width="24"
//   height="24"
//   fill="none"
//   stroke="currentColor"
//   strokeWidth="2.4"
//   strokeLinecap="round"
//   strokeLinejoin="round"
// >
//   <path d="M7 8L12 13L17 8" />
//   <path d="M7 13L12 18L17 13" />
//   <path d="M7 18L12 23L17 18" />
// </svg>
// </span>

//           </div>
//         </div>
//       </div>

//       <div className="container">
//         <div className="services-grid">
//           {site.services.map((service, i) => (
//             <ServiceCard key={service.id} service={service} index={i} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./Services.css";

function ServiceCard({ service, index }) {
  const [ref, visible] = useReveal(0.15);
  return (
    <article
      ref={ref}
      className={`service-card ${visible ? "is-in" : ""}`}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <span className="service-dots service-dots--tl" aria-hidden="true" />

      <div className="service-card-text">
        <span className="service-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3>{service.title}</h3>
        <span className="service-underline" aria-hidden="true" />
        <p>{service.summary}</p>
        <a href="#contact" className="service-cta">
          Read More
          <span className="service-cta-arrow" aria-hidden="true">
            &rarr;
          </span>
        </a>
      </div>

      <div
        className="service-card-media"
        style={{ backgroundImage: `url(${service.image})` }}
      >
      </div>
    </article>
  );
}

export default function Services() {
  const [headRef, headVisible] = useReveal(0.4);

  return (
    <section id="services" className="services">
      <div className="services-banner">
        <div className="container">
          <div
            ref={headRef}
            className={`services-banner-head ${headVisible ? "is-in" : ""}`}
          >
            <span className="services-tag">
              <span className="services-tag-line" aria-hidden="true" />
              Our Services
              <span className="services-tag-line" aria-hidden="true" />
            </span>
            <h2 className="services-big-heading">
              <span className="shb-line shb-bold">One Stop Solution</span>
              <span className="shb-line shb-thin">For Every</span>
              <span className="shb-line shb-bold">
                Transportation <span className="shb-highlight">Need</span>
              </span>
            </h2>
            <span className="services-badge-icon" aria-hidden="true">
   <svg
   viewBox="0 0 24 24"
   width="24"
   height="24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2.4"
   strokeLinecap="round"
   strokeLinejoin="round"
 >
   <path d="M7 8L12 13L17 8" />
   <path d="M7 13L12 18L17 13" />
  <path d="M7 18L12 23L17 18" />
</svg>
</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="services-grid">
          {site.services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}