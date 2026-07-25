// ============================================================================
// CHATBOT FAQ CONFIG
// Each entry: a set of trigger keywords + the answer to give.
// Add, remove, or edit entries here without touching the ChatBot component.
// Matching is a simple keyword-overlap check (see ChatBot.jsx) - keep
// `keywords` focused on the words a customer would actually type.
// ============================================================================

export const faq = [
  {
    id: "track-shipment",
    keywords: ["track", "tracking", "where", "shipment", "status", "consignment"],
    answer:
      "You can track your shipment using the 'Track Shipment' button in the contact bar at the top, or the truck icon on the right side of the page. You'll need your consignment/booking number.",
  },
  {
    id: "get-quote",
    keywords: ["quote", "price", "cost", "rate", "charges", "estimate", "pricing"],
    answer:
      "The fastest way to get pricing is the 'Get a Quote' button — just share your origin, destination and approximate weight, and our team will respond with a rate.",
  },
  {
    id: "service-areas",
    keywords: [
      "areas",
      "where",
      "cover",
      "location",
      "district",
      "kolkata",
      "siliguri",
      "darjeeling",
      "service",
    ],
    answer:
      "We operate across West Bengal, including Kolkata, Howrah, Siliguri, Darjeeling, Jalpaiguri, Cooch Behar, Malda, Murshidabad, Bardhaman, Asansol, Kharagpur and Digha.",
  },
  {
    id: "contact-hours",
    keywords: ["hours", "open", "timing", "available", "call", "phone", "support"],
    answer:
      "Our team is reachable by phone or email during business hours, Monday to Saturday. You'll find our number and email in the top bar and footer of this page.",
  },
  {
    id: "documents",
    keywords: ["document", "papers", "invoice", "customs", "clearance", "paperwork"],
    answer:
      "Required documents vary by shipment type and route. Our customs and regulatory specialists can walk you through exactly what's needed — request a callback via 'Get a Quote' and mention documentation in your message.",
  },
  {
    id: "warehousing",
    keywords: ["warehouse", "storage", "warehousing", "inventory"],
    answer:
      "We offer tech-enabled warehousing across our network. Share your storage requirement (location, volume, duration) through 'Get a Quote' and our team will follow up.",
  },
  {
    id: "vehicle-types",
    keywords: ["truck", "vehicle", "fleet", "transport", "gps"],
    answer:
      "Our fleet includes GPS-enabled vehicles for road transport, alongside rail, air and sea partnerships for multimodal shipments.",
  },
];

// Shown when the chat first opens.
export const chatGreeting =
  "Hi! Ask me about tracking, quotes, service areas, or documentation — I'll do my best to help.";

// Shown when no FAQ entry matches well enough.
export const chatFallbackPrompt =
  "I don't have an answer for that yet. Could you leave your question and, optionally, an email or phone number? Our team will follow up.";

export const chatFallbackThanks =
  "Thanks — your question has been sent to our team and we'll get back to you.";
