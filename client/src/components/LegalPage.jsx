import { EFFECTIVE_DATE, POLICY_VERSION } from "../config/legal";
import "./LegalPage.css";

export default function LegalPage({ content }) {
  return (
    <section className="section legal-page">
      <div className="container legal-page-inner">
        <span className="eyebrow">Legal</span>
        <h1>{content.title}</h1>
        <p className="legal-meta">
          Effective {EFFECTIVE_DATE} · Version {POLICY_VERSION}
        </p>

        <p className="legal-intro">{content.intro}</p>

        {content.sections.map((section) => (
          <div key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.body?.map((para) => (
              <p key={para}>{para}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.extra?.map((para) => (
              <p key={para} className="legal-extra">
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
