import { site } from "../config/site";
import "./Footer.css";
import SmartLink from "./SmartLink";
import { useCookieConsent } from "../context/CookieConsentContext";
import {PhoneIcon, MobileIcon, MailIcon,FacebookIcon,YouTubeIcon,LinkedInIcon,} from "../assets/footerIcon";

export default function Footer() {
  const year = new Date().getFullYear();
  const { openPreferences } = useCookieConsent();

  return (
    <footer id="contact" className="footer">
      <div className="container footer-top">
        <div className="footer-col footer-brand">
          <span className="footer-brand-name">{site.legalName}</span>
          {/* <p>{site.legalName}</p> */}
          <address>
            {site.contact.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
<p className="footer-contact-item">
  <PhoneIcon />
  <a href={site.contact.phoneHref}>
    {site.contact.phoneDisplay}
  </a>
</p>

<p className="footer-contact-item">
  <MobileIcon />
  <a href={site.contact.mobileHref}>
    {site.contact.mobileDisplay}
  </a>
</p>

<p className="footer-contact-item">
  <MailIcon />
  <a href={site.contact.emailHref}>
    {site.contact.email}
  </a>
</p>
          <div className="footer-social">
  {site.social.map((s) => {
    const icons = {
      Facebook: FacebookIcon,
      YouTube: YouTubeIcon,
      LinkedIn: LinkedInIcon,
    };

    const Icon = icons[s.label];

    return (
      <a
        key={s.label}
        href={s.href}
        aria-label={s.label}
      >
        {Icon && <Icon />}
      </a>
    );
  })}
</div>
        </div>

        <div className="footer-col">
          <h4>About</h4>
          <ul>
            {site.footerLinks.about.map((l) => (
              <li key={l.label}>
                <SmartLink href={l.href}>{l.label}</SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {site.footerLinks.quick.map((l) => (
              <li key={l.label}>
                <SmartLink href={l.href}>{l.label}</SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Policies</h4>
          <ul>
            {site.footerLinks.policies.map((l) => (
              <li key={l.label}>
                <SmartLink href={l.href}>{l.label}</SmartLink>
              </li>
            ))}
            <li>
              <button className="footer-cookie-link" onClick={openPreferences}>
                Cookie Preferences
              </button>
            </li>
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
