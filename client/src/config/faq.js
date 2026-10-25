// Quick Transolution chatbot FAQ configuration

export const faq = [
  // Company information

  {
    id: "companyIntroduction",
    keywords: ["company", "about", "quick transolution", "who are you", "introduction"],
    answer:
      "Quick Transolution Pvt. Ltd. provides transportation and logistics solutions for businesses. Our services include multimodal transportation, warehousing, customs clearance, express cargo, supply chain management, and import export support.",
  },
  {
    id: "companyProfile",
    keywords: ["company profile", "business profile", "company details", "about us"],
    answer:
      "You can learn more about Quick Transolution through the Company Profile section of our website. It provides information about our business, logistics capabilities, and the industries we serve.",
  },
  {
    id: "companyLocation",
    keywords: ["office address", "head office", "registered office", "company address", "kolkata office"],
    answer:
      "Our listed office address is Unit 504, Infinity Benchmark, Sector V, Salt Lake, Kolkata 700091, West Bengal, India.",
  },
  {
    id: "companyNetwork",
    keywords: ["network", "coverage", "nationwide", "india network", "office network"],
    answer:
      "We provide logistics services through our network across India, with a strong presence in West Bengal and connections to international routes serving Nepal, Bhutan, and Bangladesh. Contact our team to confirm availability for your particular route.",
  },
  {
    id: "companyStrengths",
    keywords: ["why choose", "advantages", "benefits", "why quick transolution", "reliable company"],
    answer:
      "Quick Transolution brings transportation, warehousing, documentation, and supply chain support together. Our website also highlights GPS enabled vehicles, digital shipment tracking, and coordinated logistics services.",
  },

  // Shipment tracking

  {
    id: "trackShipment",
    keywords: ["track shipment", "track my shipment", "shipment tracking", "tracking status", "track consignment"],
    answer:
      "To track your shipment, open the Track Shipment page and enter your tracking ID. You can view the current status, last known location, and available movement history.",
    links: [{ label: 'Track Shipment', href: '/track' }],
  },
  {
    id: "trackingId",
    keywords: ["tracking id", "consignment number", "tracking number", "shipment number", "where find tracking"],
    answer:
      "Your tracking ID is generally available in the SMS or email confirmation received when your shipment was booked. Enter that ID on the Track Shipment page to check its status.",
    links: [{ label: 'Track Shipment', href: '/track' }],
  },
  {
    id: "trackingNotWorking",
    keywords: ["tracking not working", "invalid tracking", "tracking error", "shipment not found", "wrong tracking"],
    answer:
      "Please check that your tracking ID is entered correctly. If the shipment still cannot be found, contact our team using the phone number or email shown on our website.",
    links: [{ label: 'Track Shipment', href: '/track' }, { label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "trackingPrivate",
    keywords: ["private shipment", "receiver phone", "last four digits", "tracking verification", "tracking security"],
    answer:
      "Some shipments require additional verification using the last four digits of the receiver's phone number. Follow the instructions shown on the tracking page when this verification is requested.",
  },
  {
    id: "shipmentStatus",
    keywords: ["shipment status meaning", "in transit", "out for delivery", "delivered status", "shipment stages"],
    answer:
      "Shipment statuses describe the current stage of your consignment. For example, In Transit means the shipment is moving through the logistics network, Out for Delivery means delivery is in progress, and Delivered indicates that delivery has been recorded.",
  },
  {
    id: "deliveryDelay",
    keywords: ["delayed shipment", "late delivery", "delivery delay", "shipment late", "not delivered"],
    answer:
      "Delivery timing can be affected by route conditions, weather, documentation, customs procedures, and other operational factors. Please share your tracking ID with our support team so they can help you check the shipment.",
  },
  {
    id: "estimatedDelivery",
    keywords: ["delivery time", "estimated delivery", "how long delivery", "arrival date", "delivery timeline"],
    answer:
      "Delivery time depends on the origin, destination, transport mode, cargo details, and applicable procedures. Contact our team with your shipment details for an estimated delivery timeline.",
  },
  {
    id: "proofOfDelivery",
    keywords: ["proof of delivery", "delivery receipt", "delivery confirmation", "pod", "received goods"],
    answer:
      "For proof of delivery or additional delivery confirmation, contact our support team and provide your tracking ID. The team can guide you based on the shipment records available.",
  },

  // Booking and quotations

  {
    id: "getQuote",
    keywords: ["get a quote", "request quote", "quotation", "freight quote", "shipping price"],
    answer:
      "Click Get a Quote on our website and provide your shipment details. Include the origin, destination, approximate weight, cargo type, and any special requirements so our team can assess your request.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "quoteCost",
    keywords: ["shipping cost", "transport charges", "freight rate", "price estimate", "how much shipping"],
    answer:
      "Transportation charges depend on the route, shipment weight, cargo dimensions, transport mode, handling requirements, and applicable services. Submit a quotation request for pricing based on your requirements.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "quoteResponse",
    keywords: ["quote response", "quotation response", "quote pending", "quote follow up", "quote not received"],
    answer:
      "If you have already requested a quotation and have not received a response, please contact our team using the official phone number or email listed on our website.",
    links: [{ label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "bookShipment",
    keywords: ["book shipment", "book transport", "schedule pickup", "send goods", "arrange shipment"],
    answer:
      "To arrange a shipment, submit your requirements through the Get a Quote option or contact our team directly. Share the pickup location, destination, cargo details, approximate weight, and preferred schedule.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "bookingInformation",
    keywords: ["booking details", "information needed", "shipment information", "pickup details", "cargo details"],
    answer:
      "For a booking enquiry, keep the origin, destination, cargo description, approximate weight and dimensions, preferred pickup date, and contact details ready. Additional information may be required depending on the shipment.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "changeBooking",
    keywords: ["change booking", "modify booking", "reschedule pickup", "change destination", "update shipment"],
    answer:
      "For a booking change, contact our team as soon as possible and provide your booking or tracking reference. Changes depend on the shipment's current stage and operational availability.",
  },
  {
    id: "cancelBooking",
    keywords: ["cancel booking", "cancel shipment", "stop delivery", "withdraw booking"],
    answer:
      "To request a booking cancellation, contact our team with your booking reference. Cancellation availability and any applicable charges depend on the booking conditions and shipment status.",
  },

  // Transportation services

  {
    id: "multimodalTransport",
    keywords: ["multimodal", "multiple transport modes", "road rail air sea", "combined transport"],
    answer:
      "Our multimodal transportation service coordinates suitable transport modes for a shipment. Depending on the route and requirements, transportation may involve road, rail, air, or sea connections.",
  },
  {
    id: "roadTransport",
    keywords: ["road transport", "road freight", "truck transport", "goods by road", "road shipment"],
    answer:
      "We provide road transportation solutions through our logistics network. Share your origin, destination, cargo details, and preferred schedule with our team to discuss a suitable arrangement.",
  },
  {
    id: "railTransport",
    keywords: ["rail transport", "rail freight", "train cargo", "goods by rail"],
    answer:
      "Rail transportation may be suitable for certain routes and cargo requirements. Contact our team with your origin, destination, cargo volume, and timeline to check available options.",
  },
  {
    id: "airTransport",
    keywords: ["air freight", "air cargo", "air shipment", "goods by air", "air transport"],
    answer:
      "Air freight can be considered when shipment requirements call for air transportation. Availability, transit time, and charges depend on the route, cargo, and service arrangement.",
  },
  {
    id: "seaTransport",
    keywords: ["sea freight", "ocean freight", "ship cargo", "goods by sea", "sea transport"],
    answer:
      "Sea freight may be suitable for eligible international cargo movements. Contact our team with your shipment details to discuss route availability, documentation, and pricing.",
  },
  {
    id: "expressCargo",
    keywords: ["express cargo", "urgent shipment", "priority delivery", "time critical", "fast cargo"],
    answer:
      "Our Express Cargo service is designed for time sensitive consignments that require priority handling. Contact our team with the origin, destination, cargo details, and required delivery timeline to check availability.",
  },
  {
    id: "bulkCargo",
    keywords: ["bulk cargo", "large shipment", "heavy cargo", "industrial goods", "large quantity"],
    answer:
      "We support transportation requirements for businesses moving goods in different volumes. Share your cargo type, approximate quantity, dimensions, origin, and destination so our team can assess suitable options.",
  },
  {
    id: "gpsFleet",
    keywords: ["gps tracking", "gps vehicles", "vehicle tracking", "fleet tracking", "live vehicle"],
    answer:
      "Our website highlights GPS enabled vehicles and digital shipment visibility. The tracking information available to customers depends on the shipment and the tracking services enabled for it.",
  },

  // Warehousing and supply chain

  {
    id: "warehousing",
    keywords: ["warehouse", "warehousing", "storage facility", "store inventory", "goods storage"],
    answer:
      "Our warehousing service supports business storage and inventory requirements. Contact our team with your preferred location, storage volume, duration, and handling needs to discuss available options.",
    links: [{ label: 'Our Services', href: '/#services' }, { label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "inventoryManagement",
    keywords: ["inventory management", "stock management", "inventory storage", "stock handling"],
    answer:
      "Inventory requirements can vary by product, storage location, and handling process. Share your operational needs with our team to discuss suitable warehousing and inventory support.",
  },
  {
    id: "supplyChain",
    keywords: ["supply chain", "supply chain management", "logistics management", "end to end logistics"],
    answer:
      "Our Supply Chain and 3PL service supports businesses that need coordinated logistics operations. Depending on the requirement, this can include transportation, warehousing, documentation, and distribution coordination.",
  },
  {
    id: "thirdPartyLogistics",
    keywords: ["3pl", "third party logistics", "logistics partner", "outsourced logistics"],
    answer:
      "Third party logistics helps businesses coordinate logistics activities through an external partner. Contact our team with your transportation, storage, and distribution requirements to discuss a suitable arrangement.",
  },

  // Customs and international logistics

  {
    id: "customsClearance",
    keywords: ["customs clearance", "custom clearance", "customs procedure", "border clearance"],
    answer:
      "Our Customs Clearance service supports eligible cross border shipments with customs and regulatory documentation guidance. Requirements depend on the goods, destination, and applicable regulations.",
  },
  {
    id: "importExport",
    keywords: ["import export", "international trade", "export shipment", "import shipment", "trade documentation"],
    answer:
      "Our Import Export Trading service provides trade facilitation and documentation support for eligible requirements. Contact our team with the countries involved, cargo description, and shipment details.",
  },
  {
    id: "nepalTransport",
    keywords: ["nepal", "kathmandu", "raxaul", "indo nepal", "nepal shipment"],
    answer:
      "Our website highlights logistics support for India and Nepal routes, including Indo Nepal transport corridors. Contact our team to confirm route availability, documentation requirements, and applicable clearance procedures.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "bhutanTransport",
    keywords: ["bhutan", "thimphu", "bhutan shipment", "bhutan transport"],
    answer:
      "Our logistics network includes connections serving Bhutan. Contact our team with your origin, destination, cargo details, and preferred schedule to confirm available services.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "bangladeshTransport",
    keywords: ["bangladesh", "dhaka", "bangladesh shipment", "bangladesh transport"],
    answer:
      "Our website highlights transportation and logistics connections serving Bangladesh. Contact our team to confirm route availability, transit arrangements, and the documents required for your cargo.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "customsDocuments",
    keywords: ["customs documents", "documents required", "shipping documents", "paperwork", "export documents"],
    answer:
      "Required documents depend on the cargo, route, and type of transaction. Common examples may include invoices, packing lists, transport documents, and applicable permits. Please confirm the exact requirements with our team before dispatch.",
  },
  {
    id: "ewayBill",
    keywords: ["eway bill", "e way bill", "gst documents", "gst compliance", "transport compliance"],
    answer:
      "Our website highlights support for transportation documentation and applicable GST related logistics requirements. The documents needed depend on your shipment and current regulations, so please confirm the requirements with our team.",
  },

  // Cargo handling and special requirements

  {
    id: "packaging",
    keywords: ["packaging", "packing goods", "pack cargo", "packing requirements", "protect goods"],
    answer:
      "Suitable packaging depends on the type, size, weight, and handling requirements of your goods. Please discuss fragile, valuable, or specially handled cargo with our team before arranging transport.",
  },
  {
    id: "fragileGoods",
    keywords: ["fragile goods", "breakable items", "delicate cargo", "glass items", "special handling"],
    answer:
      "Please inform our team if your shipment contains fragile or delicate goods. Share the cargo description, packaging details, and route so the handling requirements can be reviewed.",
  },
  {
    id: "restrictedGoods",
    keywords: ["restricted goods", "prohibited items", "dangerous goods", "hazardous cargo", "banned items"],
    answer:
      "Some goods require special permissions or may be restricted from transportation. Contact our team with an accurate cargo description before booking so the applicable requirements can be checked.",
  },
  {
    id: "cargoDamage",
    keywords: ["damaged goods", "cargo damage", "broken shipment", "goods damaged", "damage complaint"],
    answer:
      "If your goods arrive damaged, document the condition and contact our team with your tracking reference and relevant shipment details as soon as possible. Our team can guide you through the applicable complaint process.",
  },
  {
    id: "missingGoods",
    keywords: ["missing goods", "missing package", "short delivery", "goods missing", "lost shipment"],
    answer:
      "If part of your shipment is missing, contact our support team with your tracking ID, booking details, and a description of the missing goods. The team can help review the available shipment information.",
  },

  // Payments and invoices

  {
    id: "paymentMethods",
    keywords: ["payment methods", "how to pay", "online payment", "pay freight", "payment options"],
    answer:
      "Please confirm the accepted payment methods and payment instructions with our team when arranging your shipment. Use only the official payment channels provided by Quick Transolution.",
  },
  {
    id: "invoice",
    keywords: ["invoice", "billing", "freight bill", "tax invoice", "payment receipt"],
    answer:
      "For an invoice or billing related query, contact our team with your booking reference and relevant billing details. The team can guide you based on your shipment and account records.",
  },
  {
    id: "paymentProblem",
    keywords: ["payment failed", "payment issue", "payment deducted", "refund", "duplicate payment"],
    answer:
      "For a payment issue, contact our team through the official contact details on our website. Share the relevant booking reference and transaction information through the appropriate support channel. Never share your password, card PIN, or OTP in the chatbot.",
  },

  // Website support

  {
    id: "websiteTrackingPage",
    keywords: ["tracking page", "track page", "open tracking", "tracking website"],
    answer:
      "Open the Track Shipment option on our website to enter your tracking ID and view the available shipment information.",
    links: [{ label: 'Track Shipment', href: '/track' }],
  },
  {
    id: "websiteQuoteForm",
    keywords: ["quote form", "quotation form", "contact form", "submit enquiry", "request callback"],
    answer:
      "You can use the Get a Quote option on our website to submit your logistics requirements. Include enough information about your shipment so our team can understand your request.",
    links: [{ label: 'Get a Quote', href: '/#contact' }],
  },
  {
    id: "websiteBlogs",
    keywords: ["blog", "blogs", "articles", "resources", "logistics news"],
    answer:
      "Visit the Resources section of our website to explore the available articles and logistics related content.",
  },
  {
    id: "websitePrivacy",
    keywords: ["privacy policy", "personal information", "data privacy", "information security"],
    answer:
      "You can read our Privacy Policy through the website footer to learn more about how personal information is handled. Please avoid sharing confidential personal or payment information in this chat.",
  },
  {
    id: "websiteTerms",
    keywords: ["terms and conditions", "terms of service", "website terms", "service conditions"],
    answer:
      "Please review the Terms and Conditions page linked in our website footer for the applicable website and service terms.",
  },

// Publications, reports and resources
{
  id: "findPublications",
  keywords: [
    "where can i find your publications",
    "find publications",
    "company publications",
    "publications",
    "published content"
  ],
  answer:
    "You can explore our available publications, articles, industry reports, and company news in the Resources section of our website.",
  links: [
    { label: "Resources", href: "/blogs" }
  ],
},
{
  id: "companyReports",
  keywords: [
    "do you publish company reports",
    "company reports",
    "published reports",
    "business reports",
    "logistics reports"
  ],
  answer:
    "You can explore our Resources section for available industry reports, articles, and company updates. Please visit the section to see the content currently published.",
  links: [
    { label: "Resources", href: "/blogs" }
  ],
},
{
  id: "readReports",
  keywords: [
    "how can i read your reports",
    "read reports",
    "view reports",
    "read company reports",
    "access reports"
  ],
  answer:
    "You can read our available articles and reports through the Resources section of our website. Open the section to explore the published content.",
  links: [
    { label: "Resources", href: "/blogs" }
  ],
},
{
  id: "companyDocuments",
  keywords: [
    "where can i find company documents",
    "company documents",
    "business documents",
    "published company documents",
    "company publications and documents"
  ],
  answer:
    "You can visit our Resources section to explore published company information, articles, reports, and updates. For a specific official document that is not available there, please contact our team.",
  links: [
    { label: "Resources", href: "/blogs" },
    { label: "Contact Us", href: "/#contact" }
  ],
},
{
  id: "onlinePublications",
  keywords: [
    "are your publications available online",
    "publications online",
    "read publications online",
    "online company publications",
    "available online"
  ],
  answer:
    "Yes, you can explore the publications and articles available on our website through the Resources section. The available content may vary.",
  links: [
    { label: "Resources", href: "/blogs" }
  ],
},
{
  id: "downloadReports",
  keywords: [
    "can i download a report",
    "download a report",
    "download reports",
    "save company reports",
    "report download"
  ],
  answer:
    "You can open the Resources section to view our available reports and publications. If a report provides a download option, you can download it directly. Otherwise, please contact our team for assistance.",
  links: [
    { label: "Resources", href: "/blogs" },
    { label: "Contact Us", href: "/#contact" }
  ],
},

  // Careers and recruitment

  {
    id: "careers",
    keywords: ["career", "careers", "jobs", "job vacancy", "employment opportunity"],
    answer:
      "Visit the Careers section of our website to view available job opportunities. The roles displayed depend on the current recruitment listings.",
    links: [{ label: 'Jobs', href: '/careers' }],
  },
  {
    id: "jobApplication",
    keywords: ["job application", "apply for job", "submit resume", "send cv", "career application"],
    answer:
      "Open the Careers section, choose an available position, and follow the application instructions on its details page. Check that your information and required documents are complete before submitting.",
    links: [{ label: 'Jobs', href: '/careers' }],
  },
  {
    id: "applicationStatus",
    keywords: ["application status", "job status", "interview status", "recruitment update", "application update"],
    answer:
      "For an update on a submitted job application, contact the recruitment team through the official contact channel and provide your application reference if available.",
    links: [{ label: 'Jobs', href: '/careers' }, { label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "careerResume",
    keywords: ["resume", "cv", "curriculum vitae", "resume upload", "upload resume"],
    answer:
      "For a job application, follow the resume upload instructions shown on the relevant Careers application page. Check the accepted file format and size before submitting.",
    links: [{ label: 'Jobs', href: '/careers' }],
  },

  // Customer support

  {
    id: "contactPhone",
    keywords: ["phone number", "contact number", "call number", "customer care number", "helpline"],
    answer:
      "You can contact Quick Transolution at 1800 112243 or +91 9319097898. Please use the official contact details displayed on our website.",
    links: [{ label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "contactEmail",
    keywords: ["email address", "contact email", "email id", "sales email", "mail company"],
    answer:
      "You can email our team at sales@quicktransolution.com for quotation requests and general business enquiries.",
    links: [{ label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "businessHours",
    keywords: ["business hours", "working hours", "opening hours", "office timing", "working days"],
    answer:
      "Our website information indicates that the team is reachable by phone or email during business hours from Monday to Saturday. Please contact us to confirm availability for your particular request.",
  },
  {
    id: "humanSupport",
    keywords: ["human agent", "talk to person", "speak to someone", "customer support", "contact representative"],
    answer:
      "You can speak with our team by calling 1800 112243 or +91 9319097898, or email sales@quicktransolution.com. Please include your shipment or booking reference when relevant.",
    links: [{ label: 'Contact Us', href: '/#contact' }],
  },
  {
    id: "generalEnquiry",
    keywords: ["general enquiry", "business enquiry", "partnership", "business proposal", "company enquiry"],
    answer:
      "For general business enquiries or partnership discussions, contact our team at sales@quicktransolution.com or use the contact options available on our website.",
    links: [{ label: 'Contact Us', href: '/#contact' }],
  },

  {
    id: "changeDeliveryAddress",
    keywords: ["change delivery address", "wrong address", "update address", "redirect shipment"],
    answer: "Contact our team as soon as possible if the delivery address needs to change. This depends on the shipment stage and available arrangements.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "missedDelivery",
    keywords: ["missed delivery", "delivery attempt", "recipient unavailable", "delivery failed"],
    answer: "If a delivery attempt was missed, contact our team with your tracking ID to ask about the next available step.",
    links: [{ label: "Track Shipment", href: "/track" }, { label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "lostShipment",
    keywords: ["lost shipment", "lost package", "missing parcel", "shipment missing"],
    answer: "If you believe your shipment is missing, contact our team with the tracking ID, booking details and a description of the goods.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "partialDelivery",
    keywords: ["partial delivery", "short delivery", "items missing", "incomplete shipment"],
    answer: "If the delivered quantity does not match the shipment, contact our team with your tracking ID and a description of what is missing.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "quoteAccuracy",
    keywords: ["accurate quote", "quote details", "what details for quote", "cargo dimensions"],
    answer: "For a more accurate quotation, provide the pickup and delivery locations, cargo description, package count, weight, dimensions and preferred date.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "pickupAvailability",
    keywords: ["pickup service", "home pickup", "door pickup", "collect goods"],
    answer: "Pickup availability depends on the origin, cargo and service arrangement. Share the pickup address and shipment details with our team to check the options.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "bulkBooking",
    keywords: ["bulk booking", "regular shipment", "daily transport", "monthly logistics"],
    answer: "For regular or high volume shipments, share your expected volume, routes, schedule and cargo details so our team can review the requirement.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "fullTruckLoad",
    keywords: ["full truck load", "dedicated truck", "ftl", "whole truck"],
    answer: "A dedicated truck may suit a larger shipment. Share the cargo details, loading locations and schedule so our team can assess the requirement.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "partTruckLoad",
    keywords: ["part truck load", "shared truck", "ptl", "partial load"],
    answer: "For cargo that does not need a full truck, contact our team with the shipment size and route to check suitable transport options.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "heavyCargo",
    keywords: ["heavy cargo", "oversized cargo", "large machinery", "industrial equipment"],
    answer: "Heavy or oversized cargo may need special vehicles, handling and route checks. Provide the dimensions, weight, pickup location and destination before booking.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "distribution",
    keywords: ["distribution", "distribute products", "delivery network", "goods distribution"],
    answer: "Distribution requirements depend on delivery locations, shipment volume and schedule. Share these details with our team to discuss suitable logistics support.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "internationalShipping",
    keywords: ["international shipping", "overseas shipment", "ship abroad", "global shipping"],
    answer: "International shipment options depend on the countries, cargo type, documents and service availability. Send the details to our team for a route review.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "customsDelay",
    keywords: ["customs delay", "held at customs", "border delay", "customs hold"],
    answer: "A customs review can depend on documents, cargo type and applicable rules. Contact our team with your shipment reference for guidance on the available information.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "perishableGoods",
    keywords: ["perishable goods", "food shipment", "temperature controlled", "fresh products", "cold storage"],
    answer: "Perishable goods may need specific temperature, packaging and transit conditions. Contact our team before booking to confirm whether the required handling is available.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "valuableGoods",
    keywords: ["valuable goods", "high value cargo", "expensive items", "valuable shipment"],
    answer: "For valuable goods, share the cargo description and any special handling or insurance requirements before booking. Confirm the available terms with our team.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "packagingSize",
    keywords: ["package size", "dimensions", "measure parcel", "weight and size", "cargo measurement"],
    answer: "Measure the length, width and height of each package and provide the actual weight. Accurate measurements help our team assess transport options and pricing.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "paymentSecurity",
    keywords: ["payment security", "is payment safe", "otp", "card pin", "upi pin"],
    answer: "Never share your OTP, card PIN, UPI PIN or password in the chatbot. Use only verified payment instructions provided through official company channels.",
  },
  {
    id: "insurance",
    keywords: ["cargo insurance", "shipment insurance", "insurance coverage", "insure goods"],
    answer: "Insurance availability and coverage depend on the shipment and agreed terms. Ask our team about available options before booking if your cargo needs insurance.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "internship",
    keywords: ["internship", "intern", "student job", "training opportunity"],
    answer: "Please check the Jobs page for current openings. If no suitable opportunity is listed, contact our team to ask whether any relevant positions are available.",
    links: [{ label: "Jobs", href: "/careers" }, { label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "jobEligibility",
    keywords: ["job eligibility", "qualification for job", "job requirements", "experience required"],
    answer: "Eligibility and experience requirements vary by position. Read the details on the relevant job listing before applying.",
    links: [{ label: "Jobs", href: "/careers" }],
  },
  {
    id: "jobVacancy",
    keywords: ["current vacancy", "latest jobs", "open positions", "available jobs", "hiring now"],
    answer: "The Jobs page shows the openings currently published on our website. Please check the listing for the latest role details.",
    links: [{ label: "Jobs", href: "/careers" }],
  },
  {
    id: "complaint",
    keywords: ["complaint", "raise complaint", "service complaint", "report problem"],
    answer: "Contact our team with a clear description of the issue, your booking or tracking reference and the shipment date. This will help the team review the matter.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "feedback",
    keywords: ["feedback", "suggestion", "review service", "share feedback"],
    answer: "We welcome feedback about your experience. Share your comments through the contact section of our website.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "accountLogin",
    keywords: ["login", "log in", "sign in", "account access", "cannot login"],
    answer: "Use the login option provided on the website for your account type. If access fails, contact the relevant support team and never share your password in chat.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "websiteIssue",
    keywords: ["website not working", "page error", "site problem", "website error", "button not working"],
    answer: "Try refreshing the page and checking your internet connection. If the issue continues, contact our team and mention the page and action that caused the problem.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "serviceAvailability",
    keywords: ["service available", "do you provide", "can you transport", "available in my area"],
    answer: "Service availability depends on the route, cargo and timing. Share these details with our team so they can confirm whether the service is available.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "fragileCargoClaim",
    keywords: ["fragile shipment claim", "broken goods claim", "cargo claim", "claim process"],
    answer: "Contact our team promptly with the tracking reference, shipment details and clear evidence of the issue. The team can explain the applicable review process and requirements.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },

  {
    id: "shipmentWeight",
    keywords: ["shipment weight", "cargo weight", "how much weight", "weigh package"],
    answer: "Please provide the actual weight of the cargo and the dimensions of each package when requesting a quotation.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "multiplePackages",
    keywords: ["multiple packages", "many boxes", "number of parcels", "several cartons"],
    answer: "For multiple packages, share the package count, dimensions, total weight and cargo description so the shipment can be assessed correctly.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "pickupDate",
    keywords: ["pickup date", "when pickup", "schedule date", "pickup schedule"],
    answer: "Share your preferred pickup date when submitting the shipment details. The final schedule depends on availability and confirmation from our team.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "deliveryProof",
    keywords: ["who received shipment", "receiver name", "delivery proof", "delivery signature"],
    answer: "For available delivery confirmation details, contact our team and provide the tracking ID so the shipment record can be checked.",
    links: [{ label: "Track Shipment", href: "/track" }, { label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "businessShipment",
    keywords: ["business shipment", "company goods", "factory shipment", "commercial cargo"],
    answer: "For commercial cargo, provide the pickup and delivery locations, cargo description, package count, weight and expected schedule. Our team can review the requirement.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "routeAvailability",
    keywords: ["route availability", "do you serve this route", "transport route", "ship from to"],
    answer: "Route availability depends on the origin, destination, cargo and requested date. Share those details with our team for confirmation.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "deliveryCharges",
    keywords: ["delivery charges", "extra charges", "additional fees", "handling charges"],
    answer: "Charges depend on the agreed service, route, cargo details and any special handling. Request a quotation to understand the applicable charges before booking.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "quoteValidity",
    keywords: ["quote validity", "quotation validity", "how long quote valid", "rate expiry"],
    answer: "Please check the validity period written on your quotation. If it is not shown or has expired, contact our team before confirming the shipment.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "bookingConfirmation",
    keywords: ["booking confirmation", "confirm booking", "booking confirmed", "shipment confirmation"],
    answer: "Please keep the booking confirmation and reference provided by our team. If you are unsure whether the booking is confirmed, contact the team before dispatch.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "senderReceiverDetails",
    keywords: ["sender details", "receiver details", "consignor", "consignee", "recipient information"],
    answer: "Provide accurate sender and receiver names, addresses and contact details through the official booking process. Avoid posting private contact information in the chatbot.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "warehouseDuration",
    keywords: ["storage duration", "how long storage", "warehouse period", "storage period"],
    answer: "Storage duration and availability depend on the location, space and type of goods. Share the expected duration and volume with our team for review.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "warehouseLocation",
    keywords: ["warehouse location", "where is warehouse", "storage near me", "warehouse city"],
    answer: "Warehouse availability depends on the required location and storage needs. Contact our team with your preferred city and cargo details to check options.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "stockMovement",
    keywords: ["stock movement", "move inventory", "warehouse to warehouse", "transfer stock"],
    answer: "For inventory movement between locations, share the pickup and delivery addresses, stock volume and preferred schedule with our team.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "customsFees",
    keywords: ["customs fees", "import duty", "duty charges", "border fees"],
    answer: "Customs duties and fees depend on the goods, destination and applicable rules. Confirm the amounts with the relevant authority or a qualified customs professional before shipping.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "commercialInvoice",
    keywords: ["commercial invoice", "invoice for export", "invoice customs", "goods invoice"],
    answer: "A commercial invoice may be required for some international shipments. The exact documentation depends on the goods and destination, so confirm the requirements before dispatch.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "packingList",
    keywords: ["packing list", "package list", "list of goods", "carton details"],
    answer: "A packing list can describe the packages, contents, quantities and dimensions. Whether it is required depends on the shipment and route. Confirm the document list before dispatch.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "fragilePacking",
    keywords: ["pack glass", "fragile packing", "protective packaging", "packing fragile items"],
    answer: "Use sturdy packaging and suitable protective material for fragile goods. Tell our team about the fragile contents before booking so handling needs can be reviewed.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "liquidCargo",
    keywords: ["liquid cargo", "ship liquids", "chemical liquid", "liquid transport"],
    answer: "Liquid cargo may have packaging, safety and regulatory requirements. Provide the product description and relevant safety details to our team before requesting transport.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "electronicGoods",
    keywords: ["electronics shipment", "ship electronics", "computer equipment", "electronic cargo"],
    answer: "For electronic goods, share the item description, value where relevant, packaging and handling needs. Confirm any special requirements with our team before booking.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "cargoReturn",
    keywords: ["return shipment", "send goods back", "return cargo", "reverse logistics"],
    answer: "For a return shipment, share the original reference, pickup location, destination and cargo details with our team to check the available arrangement.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "invoiceCorrection",
    keywords: ["wrong invoice", "invoice correction", "billing mistake", "incorrect bill"],
    answer: "For an invoice correction, contact our team with the invoice number and a clear description of the issue. Do not include sensitive payment credentials.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "paymentReceipt",
    keywords: ["payment receipt", "receipt copy", "proof of payment", "payment confirmation"],
    answer: "For a payment receipt or confirmation, contact our team with the relevant booking reference and transaction date through an official support channel.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "businessAccount",
    keywords: ["business account", "corporate account", "open account", "credit account"],
    answer: "For account options for a business, contact our team and describe your expected shipment volume and payment requirements. Any account arrangement must be confirmed by the company.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "jobInterview",
    keywords: ["job interview", "interview date", "interview preparation", "interview call"],
    answer: "For interview details, follow the instructions in the official communication you received. Contact the recruitment team if you need to confirm the date or next step.",
    links: [{ label: "Jobs", href: "/careers" }, { label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "jobDocuments",
    keywords: ["documents for job", "job documents", "certificates for interview", "application documents"],
    answer: "Required documents vary by position. Follow the instructions on the job listing and in any official recruitment communication.",
    links: [{ label: "Jobs", href: "/careers" }],
  },
  {
    id: "jobApplicationMistake",
    keywords: ["wrong job application", "application mistake", "edit application", "update resume"],
    answer: "If you submitted incorrect application information, contact the recruitment team and explain what needs to be corrected. Changes may depend on the application stage.",
    links: [{ label: "Jobs", href: "/careers" }, { label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "contactResponseTime",
    keywords: ["when will you reply", "response time", "how soon reply", "contact response"],
    answer: "Response time depends on the type of request and current workload. Include clear details and a reference number where available to help our team review your enquiry.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "changeContactDetails",
    keywords: ["change phone number", "update email", "change contact details", "correct contact information"],
    answer: "For a correction to contact details connected with a booking or enquiry, contact our team through an official channel and provide the relevant reference.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
  {
    id: "serviceList",
    keywords: ["list of services", "all services", "what services", "services offered"],
    answer: "Our website presents transportation, multimodal logistics, warehousing, supply chain support, customs clearance and import export related services. Availability depends on the specific requirement.",
    links: [{ label: "Our Services", href: "/#services" }],
  },
  {
    id: "requestCallback",
    keywords: ["request callback", "call me back", "please call", "callback request"],
    answer: "Use the contact section or Get a Quote form to share your request and preferred contact details. Avoid sharing passwords or payment credentials.",
    links: [{ label: "Get a Quote", href: "/#contact" }],
  },
  {
    id: "workingSaturday",
    keywords: ["open saturday", "saturday working", "available saturday", "weekend service"],
    answer: "Our listed contact availability is Monday to Saturday during business hours. Please contact the team to confirm availability for your particular request.",
    links: [{ label: "Contact Us", href: "/#contact" }],
  },
];

// Message shown when the chatbot opens.

export const chatGreeting =
  "Hello! Welcome to Quick Transolution. I can help with shipment tracking, bookings, quotations, transportation services, warehousing, documentation, careers, and general enquiries. What would you like to know?";

// Message shown when no FAQ entry matches.

export const chatFallbackPrompt =
  "I could not find a suitable answer to your question. Please share your question and, if you wish, an email address or phone number so our team can follow up.";

export const chatFallbackThanks =
  "Thank you. Your question has been submitted to our team. We will follow up through the contact details you provided when a response is available.";