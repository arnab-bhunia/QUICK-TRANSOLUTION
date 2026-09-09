import { site } from "../config/site";
import "./Footer.css";
import SmartLink from "./SmartLink";
import { useCookieConsent } from "../context/CookieConsentContext";
import {PhoneIcon, MobileIcon, MailIcon,FacebookIcon,YouTubeIcon,LinkedInIcon,LocationIcon,} from "../assets/footerIcon";
import { ChevronIcon } from "../admin/icons";

export default function Footer() {
  const year = new Date().getFullYear();
  const { openPreferences } = useCookieConsent();

  return (
    <footer id="contact" className="footer">
      <div className="container footer-top">
        <div className="footer-col footer-brand">
          <span className="footer-brand-name">{site.legalName}</span>
          {/* <p>{site.legalName}</p> */}
<address className="footer-contact-item">
  <LocationIcon />

  <span className="footer-contact-address">
    {site.contact.address.map((line) => (
      <span key={line}>{line}</span>
    ))}
  </span>
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
                <SmartLink href={l.href}><span>{l.label}</span>
                  <ChevronIcon />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {site.footerLinks.quick.map((l) => (
              <li key={l.label}>
                <SmartLink href={l.href}><span>{l.label}</span>
                  <ChevronIcon />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Policies</h4>
          <ul>
            {site.footerLinks.policies.map((l) => (
              <li key={l.label}>
                <SmartLink href={l.href}><span>{l.label}</span>
                  <ChevronIcon />
                </SmartLink>
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

  <div className="footer-decoration" aria-hidden="true">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 388 70"
      preserveAspectRatio="none"
    >
<radialGradient
  id="footerWaveGradient"
  cx="38%"
  cy="25%"
  r="78%"
>
  <stop offset="0%" stopColor="#103651" />
  <stop offset="40%" stopColor="#0b2538" />
  <stop offset="70%" stopColor="#0f293b" />
  <stop offset="88%" stopColor="#0a2234" />
  <stop offset="100%" stopColor="#0A1F2E" />
</radialGradient>
      <path
        d="M0 15
           C35 34 58 52 91 55
           C128 58 157 47 194 38
           C231 29 264 25 291 31
           C333 39 360 53 388 70
           L388 70
           L0 70
           Z"
        fill="url(#footerWaveGradient)"
      />
    </svg>
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
