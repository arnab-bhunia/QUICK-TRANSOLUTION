import { site } from "../config/site";
import { useReveal } from "../hooks/useReveal";
import "./Sectors.css";
import { FMCGIcon, PharmaIcon, AutomotiveIcon, PackagingIcon, PublishingIcon, InfrastructureIcon, EngineeringIcon, TelecomIcon,} from "../assets/industryIcon";

export default function Sectors() {
  const [ref, visible] = useReveal(0.3);
  const sectorIcons = {
  "FMCG": FMCGIcon,
  "Pharma & Healthcare": PharmaIcon,
  "Automotive": AutomotiveIcon,
  "Packaging": PackagingIcon,
  "Publishing & Media": PublishingIcon,
  "Infrastructure": InfrastructureIcon,
  "Engineering": EngineeringIcon,
  "Telecom": TelecomIcon,
};

  return (
    <section id="sectors" className="section sectors">
      <div className="container">
        {/* Background graphic */}
        <img
          src="/quick-graphic.svg"
          alt=""
          className="sectors-bg"
          aria-hidden="true"
        />
        <div className={`section-head ${visible ? "is-in" : ""}`} ref={ref}>
          <span className="eyebrow">Our Key Sectors</span>
          <h2>Comprehensive logistics for major <span className="header-span">Industries</span></h2>
        </div>

        <div className="sectors-grid">
  {site.sectors.map((sector, i) => {
    const SectorIcon = sectorIcons[sector];

    return (
      <a
        href="#contact"
        key={sector}
        className={`sector-chip ${visible ? "is-in" : ""}`}
        style={{ transitionDelay: `${i * 60}ms` }}
      >
        {SectorIcon && <SectorIcon className="sector-icon" />}
        <span>{sector}</span>
      </a>
    );
  })}
</div>
      </div>
    </section>
  );
}
