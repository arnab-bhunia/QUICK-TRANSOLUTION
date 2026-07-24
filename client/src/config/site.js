// ============================================================================
// SITE CONFIG
// Company name, contact details, nav, and every section's copy lives here.
// Rename the company or edit any text by editing this file only.
// ============================================================================

export const site = {
  companyName: "Sugam Group",
  legalName: "Sugam Parivahan Pvt. Ltd.",
  tagline: "Delivering Trust Since 1950s",
  shortTagline: "#1 India \u2013 Nepal Transportation Provider",

  contact: {
    phoneDisplay: "1800 112 243",
    phoneHref: "tel:1800112243",
    mobileDisplay: "+91-9319097898",
    mobileHref: "tel:+919319097898",
    email: "sales@sugamgroup.com",
    emailHref: "mailto:sales@sugamgroup.com",
    address: [
      "Plot No. 027, Block B,",
      "Sector 59, Noida \u2013 201301,",
      "Uttar Pradesh, India",
    ],
  },

  social: [
    { label: "Facebook", href: "#" },
    { label: "YouTube", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],

  nav: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Why Us", href: "#why-us" },
    { label: "Clients", href: "#clients" },
    { label: "Sectors", href: "#sectors" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    eyebrow: "Single-Window Logistics Since the 1950s",
    heading: "Delivering Trust\nAcross the SAARC Region",
    body: "With over 50 years in the logistics industry, we move freight across India, Nepal, Bhutan & Bangladesh \u2014 by road, rail, air and sea \u2014 under one accountable roof.",
    primaryCta: { label: "Get a Quote", href: "#contact" },
    secondaryCta: { label: "Track a Shipment", href: "#track" },
    routeNodes: [
      { id: "delhi", label: "Delhi", x: 120, y: 210 },
      { id: "kolkata", label: "Kolkata", x: 330, y: 260 },
      { id: "kathmandu", label: "Kathmandu", x: 240, y: 130 },
      { id: "thimphu", label: "Thimphu", x: 400, y: 120 },
      { id: "dhaka", label: "Dhaka", x: 420, y: 245 },
      { id: "guwahati", label: "Guwahati", x: 470, y: 175 },
    ],
  },

  stats: [
    { value: 150, suffix: "+", label: "Offices in the SAARC Region" },
    { value: 2500, suffix: "+", label: "GPS-Enabled Vehicles" },
    { value: 5, suffix: "M+", label: "Sqft of Warehousing Space" },
    { value: 10000, suffix: "+", label: "Customers Served Annually" },
  ],

  services: [
    {
      id: "multimodal",
      title: "Multimodal Transportation",
      summary:
        "A trusted multimodal transporter across North East India, Nepal, Bhutan & Bangladesh, moving freight by whichever combination of road, rail, air and sea gets it there safest.",
    },
    {
      id: "warehousing",
      title: "Warehousing",
      summary:
        "Strategically located, tech-enabled warehousing that keeps your inventory moving, not just stored.",
    },
    {
      id: "custom-clearance",
      title: "Custom Clearance",
      summary:
        "Specialized customs and regulatory clearance for cross-border trade, including Indo-Nepal transport corridors.",
    },
    {
      id: "express-cargo",
      title: "Express Cargo",
      summary:
        "Time-critical consignments handled with priority routing and real-time visibility from pickup to delivery.",
    },
    {
      id: "supply-chain",
      title: "Supply Chain & 3PL",
      summary:
        "End-to-end supply chain management for manufacturers and distributors who need one partner, not five.",
    },
    {
      id: "import-export",
      title: "Import Export Trading",
      summary:
        "Trade facilitation and documentation support that keeps shipments compliant on both sides of the border.",
    },
  ],

  whyUs: [
    {
      id: "network",
      title: "Largest Own Network Across Nepal & NE India",
      body: "Presence in 32 of 36 states and union territories in India, with deep specialization in North East India, established operations in Bhutan, Bangladesh, and reach across the wider SAARC region.",
    },
    {
      id: "trusted",
      title: "Most Trusted Logistics Provider",
      body: "Tailor-made solutions for clients across industries, with end-to-end supply chain support for manufacturers, distributors, and service providers, and secure shipping to every destination we serve.",
    },
    {
      id: "digital",
      title: "Digital Payment & Tracking",
      body: "A GPS-enabled fleet feeds real-time shipment updates into a digital client dashboard, backed by transparent, fully digital transactions.",
    },
    {
      id: "single-window",
      title: "Single Window Transportation",
      body: "Invoicing, warehousing, and documentation sit alongside logistics under one roof, with a single operator coordinating multimodal shipping across the region.",
    },
    {
      id: "customs",
      title: "Customs & Regulatory Specialists",
      body: "Clear guidance on documentation for inter-state and international transport, and specialized customs clearance built specifically for the Indo-Nepal corridor.",
    },
  ],

  testimonials: [
    {
      name: "Latish Poojari",
      role: "Godrej Consumer Products Ltd.",
      quote:
        "Thank you for the quality of service your team provides \u2014 efficient, gracious, and consistent in how you conduct business.",
    },
    {
      name: "Ankush Koundal",
      role: "CPPD Custom & Transport",
      quote:
        "Your team completed shipment clearance and delivery across every distribution site with steady dedication, working out solutions whenever our timelines were at risk.",
    },
    {
      name: "Abhishek Ghimire",
      role: "Factory Operations Director",
      quote:
        "Every consignment, from small parcels to bulk cargo, has been loaded, unloaded and transported safely and on schedule.",
    },
    {
      name: "Manoj Kr. Punj",
      role: "Senior Manager, Export Logistics",
      quote:
        "Good coordination and monitoring on every movement of our goods, with a track record we've come to rely on.",
    },
    {
      name: "Balaiyya B. Guglot",
      role: "Head, Supply Chain",
      quote:
        "Vehicles placed exactly to our need, with prompt performance and timely delivery every time.",
    },
  ],

  sectors: [
    "FMCG",
    "Pharmaceutical & Medical Equipment",
    "Automobiles",
    "Packaging",
    "Publishing",
    "Infrastructure & Engineering",
    "Telecom",
  ],

  footerLinks: {
    about: [
      { label: "Company Profile", href: "#about" },
      { label: "Client Testimonials", href: "#clients" },
      { label: "CSR Activity", href: "#" },
    ],
    quick: [
      { label: "Apply for a Franchise", href: "#" },
      { label: "Sales Enquiry", href: "#contact" },
      { label: "Blogs", href: "#" },
    ],
    policies: [
      { label: "FAQs", href: "#" },
      { label: "Disclaimer", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms & Conditions", href: "#" },
    ],
  },
};
