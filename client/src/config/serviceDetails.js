// ============================================================================
// SERVICE DETAIL CONTENT
// Keyed by the same `id` used in site.services (config/site.js). One entry
// per service, rendered by pages/ServiceDetailPage.jsx. Add a new service
// there AND here to get a working /services/:slug page for it.
// ============================================================================

export const serviceDetails = {
  multimodal: {
    banner: "/services/multimodal-transportation-bg.webp",
    intro:
      "We move freight by whichever combination of road, rail, air and sea gets it there fastest and safest \u2014 planned and tracked as a single, accountable shipment from origin to final delivery.",
    highlights: [
      "Seamless road \u2194 rail \u2194 air \u2194 sea handoffs under one waybill",
      "Real-time GPS visibility across every leg of the journey",
      "Dedicated route planning for time- and cost-sensitive cargo",
      "Cross-border corridors across India, Nepal, Bhutan & Bangladesh",
    ],
    sections: [
      {
        title: "One partner, every mode",
        body: "Instead of coordinating separate road, rail, air and sea vendors yourself, you get a single point of contact who plans the optimal combination for your cargo and owns the outcome end to end \u2014 fewer handoffs, fewer surprises.",
      },
      {
        title: "Built for cross-border movement",
        body: "Our multimodal network is purpose-built for the India \u2013 Nepal \u2013 Bhutan \u2013 Bangladesh corridor, with established customs relationships and documentation workflows that keep freight moving instead of sitting at a border.",
      },
    ],
  },

  warehousing: {
    banner: "/services/warehouse-bg.webp",
    intro:
      "Strategically located, tech-enabled warehousing that keeps your inventory moving through the supply chain \u2014 not sitting idle in storage.",
    highlights: [
      "Strategically located facilities near major freight corridors",
      "Real-time inventory visibility through our tracking platform",
      "Inbound QC, palletization, and outbound dispatch handled in-house",
      "Scalable short-term and long-term storage options",
    ],
    sections: [
      {
        title: "Storage that's part of the pipeline",
        body: "Our warehouses aren't just holding space \u2014 they're active nodes in your supply chain, with inbound receiving, quality checks, and outbound dispatch coordinated against your delivery schedules.",
      },
      {
        title: "Visibility on every pallet",
        body: "Inventory levels, movement history, and dispatch status are all tracked digitally, so you always know exactly what's in stock and where it's headed next.",
      },
    ],
  },

  "custom-clearance": {
    banner: "/services/custom-clearance-bg.webp",
    intro:
      "Specialized customs and regulatory clearance for cross-border trade, including the Indo-Nepal transport corridor \u2014 handled by people who know the paperwork cold.",
    highlights: [
      "Complete documentation preparation and filing",
      "Established relationships at key border checkpoints",
      "Regulatory compliance across Indian and Nepali customs law",
      "Proactive updates if a shipment needs additional clearance",
    ],
    sections: [
      {
        title: "Clearance without the guesswork",
        body: "Customs delays are almost always a documentation problem, not a shipment problem. We prepare and verify every form before it's filed, so your cargo isn't the one stuck waiting for a correction.",
      },
      {
        title: "Corridor-specific expertise",
        body: "The Indo-Nepal corridor has its own quirks and requirements. Our clearance team works this specific route regularly, so we know exactly what each checkpoint expects.",
      },
    ],
  },

  "express-cargo": {
    banner: "/services/express-cargo-bg.webp",
    intro:
      "Time-critical consignments handled with priority routing, dedicated capacity, and real-time visibility from pickup to delivery.",
    highlights: [
      "Priority routing and dedicated vehicle capacity",
      "Real-time GPS tracking on every express movement",
      "Direct escalation line to a dedicated coordinator",
      "Available across our full multimodal network",
    ],
    sections: [
      {
        title: "When the deadline can't move",
        body: "Express cargo gets priority slotting in our network \u2014 dedicated capacity, direct routing, and a coordinator watching the shipment specifically, not just as one line in a larger manifest.",
      },
      {
        title: "Visibility you can act on",
        body: "You get live location and ETA updates throughout the journey, so if something upstream needs to adjust, you know early enough to actually do something about it.",
      },
    ],
  },

  "supply-chain": {
    banner: "/services/supply-chain-bg.webp",
    intro:
      "End-to-end supply chain and third-party logistics management for manufacturers and distributors who need one accountable partner, not five separate vendors.",
    highlights: [
      "Inbound logistics, warehousing, and outbound distribution as one system",
      "Dedicated account management for ongoing operations",
      "Custom reporting aligned to your operational KPIs",
      "Scales with seasonal demand and business growth",
    ],
    sections: [
      {
        title: "Your supply chain, run as one system",
        body: "Instead of separately managing transport, storage, and distribution vendors, our 3PL service coordinates all three as a single operation \u2014 built around your existing processes, not the other way around.",
      },
      {
        title: "A team that knows your business",
        body: "A dedicated account manager stays close to your operation over time, so decisions get faster and more informed the longer we work together \u2014 not reset with every shipment.",
      },
    ],
  },

  "import-export": {
    banner: "/services/import-export-bg.webp",
    intro:
      "Trade facilitation and documentation support that keeps shipments compliant on both sides of the border \u2014 from LC and invoicing to final customs sign-off.",
    highlights: [
      "End-to-end import/export documentation support",
      "Compliance guidance for cross-border trade regulations",
      "Coordination with banks, insurers, and customs authorities",
      "Support for both commercial and project cargo",
    ],
    sections: [
      {
        title: "Trade documentation, handled properly",
        body: "Import/export trade lives or dies on paperwork accuracy \u2014 invoices, certificates of origin, letters of credit, customs declarations. We manage this end to end so a documentation gap never becomes a shipment delay.",
      },
      {
        title: "One team, both sides of the border",
        body: "We coordinate directly with banks, insurers, and customs authorities on both the origin and destination side, so you have a single point of contact instead of chasing updates from multiple parties.",
      },
    ],
  },
};
