import { site } from "../config/site";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="container footer-top">
        <div className="footer-col footer-brand">
          <span className="footer-brand-name">{site.companyName}</span>
          <p>{site.legalName}</p>
          <address>
            {site.contact.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p>
            Tel: <a href={site.contact.phoneHref}>{site.contact.phoneDisplay}</a>
          </p>
          <p>
            Mob: <a href={site.contact.mobileHref}>{site.contact.mobileDisplay}</a>
          </p>
          <p>
            Mail: <a href={site.contact.emailHref}>{site.contact.email}</a>
          </p>
          <div className="footer-social">
            {site.social.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label}>
                {s.label[0]}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <ul>
            {site.footerLinks.about.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {site.footerLinks.quick.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Policies</h4>
          <ul>
            {site.footerLinks.policies.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>
            {site.companyName}.com &copy; {year} &mdash; All Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
