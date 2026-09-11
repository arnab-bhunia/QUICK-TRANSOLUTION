// ============================================================================
// COMPANY PROFILE CONFIG
// Detailed, Company-Profile-specific content for the /company-profile page
// (pages/CompanyProfile.jsx). This file does NOT own Why Us titles/short
// copy, sector names, or service summaries — those stay in config/site.js,
// and complete per-service content stays in config/serviceDetails.js. This
// file only holds the additional detail that belongs on the Company
// Profile page itself: About, Our Story, Mission & Vision, expanded Why Us
// detail (mapped by the existing site.whyUs ids), short service
// introductions (linking out to the existing /services/:slug pages),
// detailed industry content, How We Work, Technology & Tracking, the CTA,
// and the page's SEO metadata.
// ============================================================================

// Maps each existing site.sectors display string to the stable anchor id
// used on /company-profile (see companyProfile.industries below). Kept
// here — rather than derived from utils/slugify — because slugify would
// turn "Pharma & Healthcare" into "pharma-and-healthcare", not the
// "pharma-healthcare" id this page actually uses.
export const sectorSlugs = {
  "FMCG": "fmcg",
  "Pharma & Healthcare": "pharma-healthcare",
  "Automotive": "automotive",
  "Packaging": "packaging",
  "Publishing & Media": "publishing-media",
  "Infrastructure": "infrastructure",
  "Engineering": "engineering",
  "Telecom": "telecom",
};

export const companyProfile = {
  seo: {
    title: "Company Profile | Quick Transolution Pvt. Ltd.",
    description:
      "How Quick Transolution operates as a single-window logistics partner across India, Nepal, Bhutan and Bangladesh \u2014 our services, industries served, network, technology and approach to customer support.",
    // A path, not a full URL — CompanyProfile.jsx combines this with
    // window.location.origin at render time, the same pattern
    // BlogDetails.jsx already uses for its own canonical URL.
    canonical: "/company-profile",
    ogTitle: "Quick Transolution \u2014 Company Profile",
    ogDescription:
      "A closer look at Quick Transolution's logistics network, services and approach \u2014 multimodal transportation, warehousing, customs clearance and supply chain support across the SAARC region.",
    ogImage: "/services-banner-1.webp",
    ogType: "website",
  },

  hero: {
    eyebrow: "Company Profile",
    heading: "Quick Transolution Pvt. Ltd.",
    body: "A single-window logistics partner moving freight across India, Nepal, Bhutan and Bangladesh by road, rail, air and sea \u2014 and the details behind how we operate.",
  },

  about: {
    heading: "About Quick Transolution",
    paragraphs: [
      "Quick Transolution Pvt. Ltd. is a logistics and transportation company offering multimodal transportation, warehousing, customs clearance, express cargo, supply chain management and import-export trade support together, under one company, rather than as separate standalone services.",
      "Our operations are based out of Kolkata, West Bengal, with a network that extends across India and into the neighbouring Nepal, Bhutan and Bangladesh corridors. That regional footprint shapes how we work \u2014 our services are built around the coordination that cross-border and multi-state freight movement requires.",
      "Customers reach us to move freight by whichever combination of road, rail, air and sea suits the shipment, to store inventory in tech-enabled warehousing, or to get customs and documentation handled for cross-border trade. Shipment visibility runs through our GPS-enabled fleet and online tracking portal, and enquiries, quotes and support can be reached directly through the phone, mobile and email channels listed on this site.",
    ],
  },

  story: {
    heading: "Our Story",
    paragraphs: [
      "Quick Transolution was established to address a recurring problem for businesses moving freight across India and into neighbouring countries: logistics providers were often organised around a single mode of transport or a single function, leaving the customer to coordinate transportation, warehousing, customs clearance and documentation across several separate relationships.",
      "We built our service around bringing that coordination into one place \u2014 offering multimodal transportation, warehousing, customs clearance, express cargo, supply chain management and import-export trade support as one connected service rather than six separate relationships. Since our establishment in 2026, that single-window approach has stayed the core of how we operate.",
      "Our focus stays on the same goal: giving businesses one accountable partner for the movement of their goods, with the visibility and documentation support that cross-border and multi-state logistics actually require.",
    ],
  },

  mission: {
    heading: "Mission",
    body: "To move freight reliably across India, Nepal, Bhutan and Bangladesh through a single-window service that combines multimodal transportation, warehousing, customs clearance and documentation support \u2014 backed by real-time tracking, so customers always know where their shipment stands.",
  },

  vision: {
    heading: "Vision",
    body: "To deepen our network and technology across the SAARC region, so that more businesses \u2014 across more industries \u2014 can rely on one logistics partner for transportation, storage, compliance and cross-border movement, instead of managing several.",
  },

  whyUsDetails: [
    {
      id: "network",
      paragraphs: [
        "Our network spans 150+ office locations across the SAARC region, connecting key movement points including Delhi, Kolkata, Kathmandu, Thimphu, Dhaka and Guwahati, alongside the partners, warehouses and distribution hubs that extend that reach further. For a customer, that footprint means a shipment can move through touchpoints already familiar to us, rather than being handed to an unfamiliar local operator at every stage.",
        "Because our base is in West Bengal, we're positioned directly on the routes into Nepal, Bhutan and Bangladesh, which matters for businesses whose supply chains already run through this corridor. Coordinating our own offices with partner depots and warehousing locations is what keeps a multi-leg shipment moving as one planned journey rather than several separately booked ones.",
      ],
    },
    {
      id: "trusted",
      paragraphs: [
        "Since our establishment in 2026, we've worked with businesses across FMCG, pharma & healthcare, automotive, packaging, publishing & media, infrastructure, engineering and telecom \u2014 industries with meaningfully different logistics requirements, from time-sensitive distribution to careful, documented handling.",
        "Being trusted as a logistics partner comes down to consistency: the same company plans the route, handles the paperwork and answers the phone when a customer needs an update, whatever combination of our own fleet, offices and network partners a shipment actually moves through.",
      ],
    },
    {
      id: "digital",
      paragraphs: [
        "Our fleet of 2,500+ vehicles is GPS-enabled, feeding shipment location and status into our online tracking portal so customers can check progress using their tracking ID at any time, without having to call for an update. The same portal flags shipments that need extra verification \u2014 for example, private shipments that also require the last 4 digits of the receiver's phone number before status is shown.",
        "On the payments side, we support secure digital payment options alongside traditional channels, and we're explicit with customers about security practices \u2014 we never request OTPs, UPI PINs, CVVs or verification codes over the phone, and we never ask for payment through personal phone numbers.",
      ],
    },
    {
      id: "single-window",
      paragraphs: [
        "Transportation, warehousing, customs clearance, documentation and invoicing are all offered through Quick Transolution as one connected service, through a single point of contact, rather than as separate standalone offerings a customer has to assemble themselves. That means one point of contact for a shipment's lifecycle \u2014 from booking through to delivery confirmation \u2014 instead of separately managing a trucking company, a warehouse operator and a customs agent.",
        "This is also why our six core services \u2014 multimodal transportation, warehousing, customs clearance, express cargo, supply chain & 3PL, and import-export trading \u2014 are designed to work together. A shipment that needs storage partway through its journey, or documentation at a border crossing, doesn't have to change hands to get it.",
      ],
    },
    {
      id: "customs",
      paragraphs: [
        "Cross-border movement into Nepal, Bhutan and Bangladesh, and multi-state movement within India, both come with documentation requirements that can stall a shipment if they're incomplete \u2014 e-way bills, GST-related paperwork, and the specific customs declarations each border crossing expects. We prepare and verify this documentation as part of the shipment itself, not as a separate service booked afterward.",
        "For the Indo-Nepal corridor in particular, that documentation support is built into how we route and plan a shipment from the start, rather than being handled only once a shipment reaches the border.",
      ],
    },
  ],

  // Short intros only — the complete write-up for each service lives in
  // config/serviceDetails.js and is reached through the /services/:slug
  // link. Titles/summaries stay owned by site.services; this only adds
  // the one extra sentence appropriate for this page.
  services: [
    {
      id: "multimodal",
      body: "Freight moved by whichever combination of road, rail, air and sea gets it there safest, planned and tracked as a single shipment rather than several separately booked legs.",
    },
    {
      id: "warehousing",
      body: "Tech-enabled storage positioned near major freight corridors, with inbound handling, inventory visibility and outbound dispatch coordinated against your delivery schedule.",
    },
    {
      id: "custom-clearance",
      body: "Documentation and regulatory clearance for cross-border trade, including the Indo-Nepal corridor, handled as part of the shipment itself rather than as a separate step booked afterward.",
    },
    {
      id: "express-cargo",
      body: "Priority routing and dedicated capacity for time-critical consignments, with real-time visibility from pickup through to delivery.",
    },
    {
      id: "supply-chain",
      body: "Inbound logistics, warehousing and outbound distribution coordinated as one system for manufacturers and distributors who'd rather work with one partner than several.",
    },
    {
      id: "import-export",
      body: "Trade documentation and compliance support \u2014 invoicing, certificates of origin and customs declarations \u2014 that keeps cross-border shipments moving on both sides of the border.",
    },
  ],

  industries: [
    {
      id: "fmcg",
      title: "FMCG",
      paragraphs: [
        "FMCG distribution runs on frequent, time-sensitive movement to multiple destinations, with inventory that needs to keep flowing rather than sit idle. Our multimodal transportation and warehousing work together here \u2014 goods can be stored briefly and redirected to distribution points without changing hands between providers.",
      ],
    },
    {
      id: "pharma-healthcare",
      title: "Pharma & Healthcare",
      paragraphs: [
        "Pharmaceutical and healthcare shipments depend on careful handling, accurate documentation and clear shipment visibility, since delivery timing and chain-of-custody records both matter. Our GPS-enabled tracking and documentation support give these shipments the paper trail and visibility this industry needs, alongside our customs and compliance handling for any cross-border movement.",
      ],
    },
    {
      id: "automotive",
      title: "Automotive",
      paragraphs: [
        "Automotive supply chains move components between suppliers and manufacturing facilities on tight, scheduled windows, where a late delivery can stop a production line. Our multimodal network and coordination across office locations support the scheduled, point-to-point movement this sector depends on.",
      ],
    },
    {
      id: "packaging",
      title: "Packaging",
      paragraphs: [
        "Packaging materials typically move in bulk between production and distribution sites, which is where our warehousing and multimodal transportation are put to direct use \u2014 storing and moving bulk volumes without the shipment losing coordination between the two.",
      ],
    },
    {
      id: "publishing-media",
      title: "Publishing & Media",
      paragraphs: [
        "Publishing and media distribution involves scheduled, recurring shipments to numerous destinations, often on fixed release dates. Our multimodal and warehousing services support that kind of scheduled, repeat distribution rather than one-off shipments.",
      ],
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      paragraphs: [
        "Infrastructure projects require dependable movement of materials and equipment to project sites, often across state lines and over an extended project timeline. Our transportation network and documentation support help keep that movement compliant and on schedule across the duration of a project.",
      ],
    },
    {
      id: "engineering",
      title: "Engineering",
      paragraphs: [
        "Engineering businesses often need components and equipment moved between suppliers, workshops and project sites with scheduling accuracy. Our multimodal transportation and express cargo options support both routine component movement and time-critical shipments when a project timeline requires it.",
      ],
    },
    {
      id: "telecom",
      title: "Telecom",
      paragraphs: [
        "Telecom infrastructure rollouts depend on equipment reaching multiple sites, often in different states, on a coordinated schedule. Our network across office locations and our warehousing support the staged delivery this kind of rollout typically needs.",
      ],
    },
  ],

  howWeWork: {
    heading: "How We Work",
    steps: [
      {
        title: "Tell us what you need to move",
        body: "Share your shipment or storage requirement through a quote request or a service enquiry \u2014 by mode, industry or destination \u2014 and our team reviews it against our network and service options.",
      },
      {
        title: "We plan the movement",
        body: "We work out the appropriate combination of transportation, warehousing and documentation for the shipment, including any customs or compliance steps a cross-border route requires.",
      },
      {
        title: "Your shipment moves, and you can see it moving",
        body: "Once booked, a shipment can be followed using its tracking ID through our online tracking portal, which shows the current stage, last known location and movement history.",
      },
      {
        title: "Support stays available",
        body: "If a tracking update doesn't appear as expected, or a shipment needs attention, our support team is reachable by phone, mobile or email \u2014 with your tracking ID on hand for faster assistance.",
      },
    ],
  },

  technology: {
    heading: "Technology & Tracking",
    paragraphs: [
      "Our fleet of 2,500+ vehicles is GPS-enabled, and shipment status is available to customers directly through our online tracking portal \u2014 no need to call in for a routine status check. Some shipments are marked private and require the receiver's phone number for verification before status is shown, an added layer we apply where a shipment's visibility needs to stay restricted.",
      "Client accounts on our platform provide a dashboard view of shipment activity, and we support secure digital payment options for bookings and invoicing. We're also direct with customers about security: we never ask for OTPs, UPI PINs, CVVs or passwords, and any request claiming to be from us that does so should be treated as suspicious and verified through our official contact channels.",
    ],
  },

  cta: {
    heading: "Talk to us about your next shipment",
    body: "Whether it's a single consignment or an ongoing supply chain requirement, our team can walk you through the right combination of transportation, warehousing and compliance support.",
    primaryCta: { label: "Get a Quote", href: "#contact" },
    secondaryCta: { label: "Track a Shipment", href: "/track" },
  },
};
