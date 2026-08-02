import {OfficeIcon, TruckIcon,WarehouseIcon,CustomerIcon,} from "../assets/statIcons";
// ============================================================================
// SITE CONFIG
// Company name, contact details, nav, and every section's copy lives here.
// Rename the company or edit any text by editing this file only.
// ============================================================================

export const site = {
  companyName: "Quick Transolution",
  legalName: "Quick Transolution Pvt. Ltd.",
  tagline: "Delivering Trust Since 2026s",
  shortTagline: "#1 India \u2026 West Bengal Transportation Provider",

  contact: {
    phoneDisplay: "1800 112 243",
    phoneHref: "tel:1800112243",
    mobileDisplay: "+91-9319097898",
    mobileHref: "tel:+919319097898",
    email: "sales@quicktransolution.com",
    emailHref: "mailto:sales@quicktransolution.com",
    address: [
      "Unit No. 504, 5th Floor,",
  "Infinity Benchmark, Sector V, Salt Lake,",
  "Kolkata – 700091,",
  "West Bengal, India",
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
    { label: "Track Shipment", href: "/track" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    eyebrow: "Single-Window Logistics Since the 2026s",
    heading: "Delivering Trust\nAcross the Region",
    body: "With over 50 years in the logistics industry, we move freight across India, Nepal, Bhutan & Bangladesh \u2014 by road, rail, air and sea \u2014 under one accountable roof.",
    primaryCta: { label: "Get a Quote", href: "#contact" },
    secondaryCta: { label: "Track a Shipment", href: "/track" },
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
    { icon: OfficeIcon, value: 150, suffix: "+", label: "Offices in the SAARC Region" },
    { icon: TruckIcon, value: 2500, suffix: "+", label: "GPS-Enabled Vehicles" },
    { icon: WarehouseIcon, value: 5, suffix: "M+", label: "Sqft of Warehousing Space" },
    { icon: CustomerIcon,value: 10000, suffix: "+", label: "Customers Served Annually" },
  ],

  services: [
    {
      id: "multimodal",
      title: "Multimodal Transportation",
      summary:
        "A trusted multimodal transporter across India & Bangladesh, moving freight by whichever combination gets it there safest.",
      image: "services/multimodal-transportation-bg.webp", 
      },
    {
      id: "warehousing",
      title: "Warehousing",
      summary:
        "Strategically located, tech-enabled warehousing that keeps your inventory moving, not just stored.",
      image: "services/warehouse-bg.webp",
      },
    {
      id: "custom-clearance",
      title: "Custom Clearance",
      summary:
        "Specialized customs and regulatory clearance for cross-border trade, including Indo-Nepal transport corridors.",
      image: "services/custom-clearance-bg.webp",
      },
    {
      id: "express-cargo",
      title: "Express Cargo",
      summary:
        "Time-critical consignments handled with priority routing and real-time visibility from pickup to delivery.",
      image: "services/express-cargo-bg.webp",
      },
    {
      id: "supply-chain",
      title: "Supply Chain & 3PL",
      summary:
        "End-to-end supply chain management for manufacturers and distributors who need one partner, not five.",
      image: "services/supply-chain-bg.webp",},
    {
      id: "import-export",
      title: "Import Export Trading",
      summary:
        "Trade facilitation and documentation support that keeps shipments compliant on both sides of the border.",
      image: "services/import-export-bg.webp",},
  ],

whyUs: [
  {
    id: "network",
    title: "Strong Network Across India & West Bengal",
    body: "Operating across major states of India with a strong logistics presence in West Bengal, we provide reliable transportation solutions through an extensive network of partners, warehouses, and distribution hubs, ensuring seamless connectivity nationwide.",
  },
  {
    id: "trusted",
    title: "Trusted Logistics Partner Since 2026",
    body: "Since our establishment in 2026, we have been committed to delivering dependable, customer-focused logistics solutions with safe, timely, and cost-effective transportation services for businesses across multiple industries.",
  },
  {
    id: "digital",
    title: "Digital Tracking & Secure Payments",
    body: "Our GPS-enabled fleet and digital tracking platform provide real-time shipment visibility, while secure online payment options and transparent communication ensure a smooth customer experience from pickup to delivery.",
  },
  {
    id: "single-window",
    title: "Complete Logistics Under One Roof",
    body: "From transportation and warehousing to documentation and invoicing, we offer comprehensive logistics solutions through a single point of contact, simplifying supply chain management for businesses across India.",
  },
  {
    id: "customs",
    title: "Compliance & Documentation Support",
    body: "We assist customers with transportation documentation, e-way bills, GST-related logistics compliance, and regulatory requirements, ensuring smooth and hassle-free movement of goods across India.",
  },
],

  testimonials: [
    {
      name: "Latish Poojari",
      role: "Supply Chain Head",
      quote:
        "Thank you for the quality of service your team provides \u2014 efficient, gracious, and consistent in how you conduct business.",
      company: "Godrej Consumer Products Ltd.",
      image: "/testimonials/testimonials-common.png",
      logo: "//godrej.svg"
      },
    {
      name: "Ankush Koundal",
      role: "CPPD Custom & Transport",
      company: "Godrej Consumer Products Ltd.",
      quote:
        "Your team completed shipment clearance and delivery across every distribution site with steady dedication, working out solutions whenever our timelines were at risk.",
    image: "/testimonials/testimonials-common.png",
      logo: "//godrej.svg"
      },
    {
      name: "Abhishek Ghimire",
      role: "Factory Operations Director",
      company: "Godrej Consumer Products Ltd.",
      quote:
        "Every consignment, from small parcels to bulk cargo, has been loaded, unloaded and transported safely and on schedule.",
    image: "/testimonials/testimonials-common.png",
      logo: "//godrej.svg"
      },
    {
      name: "Manoj Kr. Punj",
      role: "Senior Manager, Export Logistics",
      company: "Godrej Consumer Products Ltd.",
      quote:
        "Good coordination and monitoring on every movement of our goods, with a track record we've come to rely on.",
    image: "/testimonials/testimonials-common.png",
      logo: "//godrej.svg"
      },
    {
      name: "Balaiyya B. Guglot",
      role: "Head, Supply Chain",
      company: "Godrej Consumer Products Ltd.",
      quote:
        "Vehicles placed exactly to our need, with prompt performance and timely delivery every time.",
    image: "/testimonials/testimonials-common.png",
      logo: "//godrej.svg"
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

track: {
  steps: [
    {
      title: "Find your tracking ID",
      body: "It's on the SMS or email confirmation you received when the shipment was booked.",
    },
    {
      title: "Enter it below",
      body: "Some shipments are marked private and will also ask for the last 4 digits of the receiver's phone number.",
    },
    {
      title: "View live status",
      body: "See the current stage, last known location, and full movement history.",
    },
  ],
  importantInfo: [
    "Tracking information may take 15\u201360 minutes to appear after a shipment is booked.",
    "During weekends, holidays, or severe weather, updates may be delayed.",
    "Some shipments receive updates only after reaching the next scanning facility.",
    "International shipments may pause while undergoing customs clearance.",
    "If no update appears for more than 24 hours, please contact customer support.",
  ],
  securityNotice: [
    "Never share OTP, UPI PIN, CVV, passwords, or verification codes.",
    "We never request payment through personal phone numbers.",
    "Always contact us using official communication channels.",
    "Verify suspicious messages before making any payment.",
  ],
  faqs: [
    {
      question: "Why is my tracking not updating?",
      answer:
        "A shipment is updated only after it reaches the next scanning point. Transit between facilities may temporarily show no new events.",
    },
    {
      question: "Tracking ID not found?",
      answer:
        "Please wait a short while after booking. Newly created shipments may require some time before tracking becomes available.",
    },
    {
      question: 'What does "In Transit" mean?',
      answer:
        "Your shipment is moving through our logistics network toward the destination.",
    },
    {
      question: "What if my shipment is delayed?",
      answer:
        "Operational factors such as weather conditions, public holidays, customs clearance, or regional restrictions may affect delivery timelines.",
    },
    {
      question:
        'Why does my shipment show "Delivered" but I haven\'t received it?',
      answer:
        "Please check with the receiver, neighbors, or your building security first. If you still cannot locate the shipment, contact our support team immediately.",
    },
  ],
  needHelp:
    "If you're unable to locate your shipment, notice unexpected tracking information, or require delivery assistance, our customer support team is available to help. Please keep your Tracking ID ready when contacting us to ensure faster assistance.",
},







};
