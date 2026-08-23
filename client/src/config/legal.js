// ============================================================================
// LEGAL CONTENT
// Privacy Policy, Terms & Conditions, Disclaimer, and general FAQs.
//
// IMPORTANT: This is a well-researched template grounded in current Indian
// law (IT Act 2000, IT SPDI Rules 2011, DPDP Act 2023, DPDP Rules 2025,
// Carriage by Road Act 2007, Multimodal Transportation of Goods Act 1993)
// and standard industry practice for a logistics company — NOT a substitute
// for review by a qualified lawyer before publishing. Legal documents create
// binding obligations specific to your business; have counsel review before
// this goes live, especially the liability/limitation and dispute-resolution
// clauses in Terms & Conditions.
//
// Anything in [BRACKETS] is a placeholder you need to fill in — grievance
// officer name, CIN, etc. Bump POLICY_VERSION and EFFECTIVE_DATE any time
// you make a material change (this is what re-triggers the cookie consent
// banner for returning visitors — see CookieConsentContext.jsx).
// ============================================================================

export const POLICY_VERSION = "1.0";
export const EFFECTIVE_DATE = "23 August 2026";

const COMPANY = "Quick Transolution Pvt. Ltd.";
const ADDRESS = "Unit No. 504, 5th Floor, Infinity Benchmark, Sector V, Salt Lake, Kolkata – 700091, West Bengal, India";
const CONTACT_EMAIL = "sales@quicktransolution.com";
const GRIEVANCE_EMAIL = "grievance@quicktransolution.com"; // [SET UP THIS INBOX — required by IT Rules 2011 & DPDP Act]
const PHONE = "1800 112 243";

export const privacyPolicy = {
  title: "Privacy Policy",
  intro: `${COMPANY} ("we", "us", "our", "Company") is committed to protecting the privacy of everyone who visits ${COMPANY.replace(" Pvt. Ltd.", "")}'s website, uses our services, or communicates with us (collectively, "you"). This Privacy Policy explains what personal data we collect, why we collect it, how we use and protect it, and the rights available to you under Indian law — principally the Information Technology Act, 2000 read with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules"), and the Digital Personal Data Protection Act, 2023 read with the Digital Personal Data Protection Rules, 2025 ("DPDP Act"), as these provisions come into force.`,
  sections: [
    {
      heading: "1. Who We Are",
      body: [
        `${COMPANY}, having its registered office at ${ADDRESS}, is a "Data Fiduciary" under the DPDP Act and a "body corporate" under the SPDI Rules with respect to the personal data described in this Policy.`,
      ],
    },
    {
      heading: "2. Information We Collect",
      body: [
        "We collect information in the following ways:",
      ],
      bullets: [
        "Account information: name, email address, phone number, and password (stored only as an irreversible cryptographic hash — we never store or can see your actual password) when you create a client account.",
        "Booking and shipment information: sender and receiver names and phone numbers, pickup and delivery addresses, cargo description, and preferred dates, when you request a shipment or we process one on your behalf.",
        "Communications: information you provide when you contact us via our enquiry form, chatbot, phone, or email, including any message content and, optionally, your name and contact details.",
        "Cookies and similar technologies: see the dedicated Cookies section below.",
        "Technical information: IP address, browser type, device information, and pages visited, collected automatically for security, fraud-prevention, and site-improvement purposes.",
      ],
    },
    {
      heading: "3. How We Use Your Information",
      body: ["We process personal data only for the purposes for which it was collected, or a purpose you would reasonably expect, including to:"],
      bullets: [
        "Create and manage your account and authenticate you when you sign in.",
        "Process booking requests, coordinate shipments, and communicate delivery status and updates.",
        "Respond to enquiries, quote requests, and support messages.",
        "Detect, prevent, and investigate fraud, abuse, or security incidents (for example, automated bot detection using rate-limiting and reCAPTCHA).",
        "Comply with applicable law, regulation, legal process, or governmental request.",
        "With your consent, send you service updates or promotional communications — you may withdraw this consent at any time (see Section 8).",
      ],
    },
    {
      heading: "4. Cookies and Tracking Technologies",
      body: [
        "We use cookies and similar technologies to operate and improve our website. When you first visit, you will see a cookie banner allowing you to accept all, reject non-essential cookies, or customise your preferences by category:",
      ],
      bullets: [
        "Strictly Necessary — required for core site functionality (for example, keeping you signed in, remembering your cookie preference itself, and CSRF/security protections). These cannot be disabled, as the site cannot function without them.",
        "Analytics — help us understand how visitors use the site so we can improve it. Only set with your consent.",
        "Marketing — used to measure and improve promotional communications. Only set with your consent.",
      ],
      extra: [
        "If you are a logged-in customer, your consent choice is linked to your account. If you are not logged in, we assign your browser a random, non-identifying visitor ID (not tied to your name or any account) so we can record and honour your choice on return visits. You can change your preference at any time using the \"Cookie Preferences\" link in the site footer.",
      ],
    },
    {
      heading: "5. Sharing and Disclosure",
      body: ["We do not sell your personal data. We may share it only:"],
      bullets: [
        "With third-party carriers, transport partners, and customs agents strictly to the extent necessary to fulfil a shipment you have booked.",
        "With service providers who process data on our behalf (for example, cloud hosting and email delivery), under contractual obligations to protect it and use it only for the purpose we specify.",
        "With government authorities, regulators, or law enforcement, where required by applicable law or a valid legal process.",
        "In connection with a merger, acquisition, or sale of assets, subject to the acquiring entity honouring the commitments in this Policy.",
      ],
    },
    {
      heading: "6. Data Security",
      body: [
        "We maintain reasonable security practices and procedures as required under the SPDI Rules, including:",
      ],
      bullets: [
        "Passwords are hashed using bcrypt and are never stored or transmitted in plain text.",
        "Session authentication uses signed, httpOnly cookies that cannot be read by page scripts, reducing exposure to cross-site scripting attacks.",
        "All data in transit is encrypted via HTTPS/TLS.",
        "Administrative access to shipment and booking data is restricted to authorised staff accounts, and every material change is recorded in an internal audit log.",
        "Automated safeguards (rate limiting, input validation, and query sanitisation) protect against common web attacks.",
      ],
      extra: [
        "No method of transmission or storage is 100% secure, and we cannot guarantee absolute security. In the event of a personal data breach that affects you, we will notify you and the Data Protection Board of India as required under the DPDP Act.",
      ],
    },
    {
      heading: "7. Data Retention",
      body: [
        "We retain personal data only for as long as necessary to fulfil the purposes described in this Policy, comply with our legal obligations (including applicable tax, accounting, and consumer-protection record-keeping requirements), resolve disputes, and enforce our agreements. Account data is retained for as long as your account remains active; you may request deletion at any time as described in Section 8.",
      ],
    },
    {
      heading: "8. Your Rights",
      body: [
        "Subject to applicable law, you have the right to:",
      ],
      bullets: [
        "Access the personal data we hold about you.",
        "Correct inaccurate or incomplete personal data.",
        "Withdraw consent for any processing that relies on consent (this does not affect processing carried out before withdrawal, or processing we are legally required to continue, such as records needed for an active shipment).",
        "Request erasure of your personal data, subject to our legal retention obligations.",
        "Nominate another individual to exercise these rights on your behalf in the event of death or incapacity, as provided under the DPDP Act.",
        "Lodge a grievance with our Grievance Officer (Section 11) and, if unresolved, with the Data Protection Board of India.",
      ],
      extra: [
        "To exercise any of these rights, contact us using the details in Section 11. We will respond within the timeframe required by applicable law.",
      ],
    },
    {
      heading: "9. Children's Data",
      body: [
        "Our services are intended for individuals who are at least 18 years old. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will take steps to delete it.",
      ],
    },
    {
      heading: "10. International Data Transfers",
      body: [
        "Some of our technology service providers (such as cloud hosting infrastructure) may process data outside India. Where this occurs, we take reasonable steps to ensure such processing is subject to safeguards consistent with the DPDP Act and this Policy.",
      ],
    },
    {
      heading: "11. Grievance Officer & Contact",
      body: [
        "In accordance with the Information Technology Act, 2000 and the DPDP Act, we have designated a Grievance Officer to address your questions or concerns about this Policy or our handling of your personal data:",
      ],
      extra: [
        "[Grievance Officer Name] — [Designation]",
        `${COMPANY}, ${ADDRESS}`,
        `Email: ${GRIEVANCE_EMAIL}`,
        `Phone: ${PHONE}`,
      ],
    },
    {
      heading: "12. Changes to This Policy",
      body: [
        `We may update this Policy from time to time. Material changes will be reflected by an updated "Effective Date" above, and — where you have previously provided a cookie or data-processing consent — you will be asked to review and re-confirm your choices. We encourage you to review this Policy periodically.`,
      ],
    },
  ],
};

export const termsConditions = {
  title: "Terms & Conditions",
  intro: `These Terms & Conditions ("Terms") govern your access to and use of the ${COMPANY} website and services. By accessing our website, creating an account, or submitting a booking request, you agree to be bound by these Terms. If you do not agree, please do not use our website or services.`,
  sections: [
    {
      heading: "1. Eligibility and Accounts",
      body: [
        "You must be at least 18 years of age and capable of entering into a binding contract under the Indian Contract Act, 1872 to create a client account or submit a booking request.",
        "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorised use.",
      ],
    },
    {
      heading: "2. Nature of Our Services",
      body: [
        `${COMPANY} provides multimodal logistics coordination — including road, rail, air, and sea freight, warehousing, and documentation support — connecting customers with our network of transport and delivery partners.`,
        "Submitting a booking request through our website (including via a logged-in client account) constitutes a request for service, not a confirmed or binding contract of carriage. A booking is confirmed only when our team contacts you and agrees specific terms, rates, and schedule for that shipment.",
      ],
    },
    {
      heading: "3. Quotes and Pricing",
      body: [
        "Any pricing or rate information shown on the website, or provided through the \"Get a Quote\" form, is indicative and subject to change based on actual cargo details, route, fuel surcharges, applicable taxes, and prevailing market rates at the time of confirmed booking.",
      ],
    },
    {
      heading: "4. Your Obligations",
      body: ["When using our services, you agree that you:"],
      bullets: [
        "Will provide accurate, complete, and current information about the shipment, sender, and receiver.",
        "Will not tender any goods that are illegal, hazardous, or prohibited under applicable law (including the Carriage by Road Act, 2007 and rules made thereunder) without prior written disclosure and our express agreement to carry them.",
        "Are responsible for ensuring the goods are properly and adequately packed for the mode(s) of transport involved.",
        "Will comply with all applicable customs, export, and import regulations for the shipment.",
      ],
    },
    {
      heading: "5. Cancellations",
      body: [
        "Booking requests submitted but not yet confirmed by our team may be cancelled at no charge. Once a shipment is confirmed and in progress, cancellation terms will be as agreed at the time of confirmation, and may be subject to charges already incurred (for example, empty-running or reserved capacity).",
      ],
    },
    {
      heading: "6. Limitation of Liability",
      body: [
        "Except as required by applicable law (including any statutory liability that cannot be excluded under the Carriage by Road Act, 2007 or the Multimodal Transportation of Goods Act, 1993), our liability for loss, damage, or delay to goods is limited as agreed in the specific service agreement for that shipment, or in the absence of such agreement, as prescribed under the applicable statute governing that mode of carriage.",
        `To the maximum extent permitted by law, ${COMPANY} shall not be liable for any indirect, incidental, special, or consequential loss (including loss of profit or business opportunity) arising from use of our website or services.`,
      ],
    },
    {
      heading: "7. Intellectual Property",
      body: [
        `All content on this website — including text, graphics, logos, and software — is the property of ${COMPANY} or its licensors and is protected under the Copyright Act, 1957 and applicable trademark law. You may not reproduce, distribute, or create derivative works without our prior written consent.`,
      ],
    },
    {
      heading: "8. Third-Party Links",
      body: [
        "Our website may contain links to third-party websites. We do not control and are not responsible for the content, privacy practices, or availability of any linked third-party site.",
      ],
    },
    {
      heading: "9. Force Majeure",
      body: [
        `${COMPANY} shall not be liable for any failure or delay in performance caused by events beyond our reasonable control, including natural disasters, strikes, government action, civil unrest, pandemic, or disruption to transport infrastructure.`,
      ],
    },
    {
      heading: "10. Termination",
      body: [
        "We may suspend or terminate your account access if you breach these Terms, provide false information, or misuse our website or services (including attempts to circumvent security or rate-limiting protections).",
      ],
    },
    {
      heading: "11. Governing Law and Dispute Resolution",
      body: [
        "These Terms are governed by the laws of India. Any dispute arising out of or in connection with these Terms shall first be attempted to be resolved amicably; failing which, it shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996, with the seat and venue of arbitration in Kolkata, West Bengal, and the proceedings conducted in English. Subject to the foregoing, the courts at Kolkata, West Bengal shall have exclusive jurisdiction.",
      ],
    },
    {
      heading: "12. Changes to These Terms",
      body: [
        "We may revise these Terms from time to time. Continued use of our website or services after a change constitutes acceptance of the revised Terms.",
      ],
    },
    {
      heading: "13. Contact",
      body: [`Questions about these Terms can be sent to ${CONTACT_EMAIL} or ${PHONE}.`],
    },
  ],
};

export const disclaimer = {
  title: "Disclaimer",
  intro: `The information provided on the ${COMPANY} website is for general informational purposes only. While we strive to keep information accurate and current, please read the following disclaimers carefully.`,
  sections: [
    {
      heading: "1. No Warranty on Website Content",
      body: [
        "Rates, transit times, service coverage, and other information displayed on this website are indicative and provided in good faith, but may change without notice and do not constitute a binding offer. We make no warranty, express or implied, as to the accuracy, completeness, or reliability of any content on this website.",
      ],
    },
    {
      heading: "2. Delivery Timelines Are Estimates",
      body: [
        "Any transit time, delivery date, or tracking status shown is an estimate based on the information available to us at that time. Actual delivery may be affected by traffic, weather, customs processing, carrier scheduling, or other factors outside our control. We do not guarantee specific delivery dates unless expressly agreed in writing for a confirmed shipment.",
      ],
    },
    {
      heading: "3. Third-Party Carriers and Partners",
      body: [
        `Multimodal transportation may involve third-party carriers, customs agents, and delivery partners. Where a shipment is carried in whole or in part by a third party, ${COMPANY}'s liability is governed by the terms of the Multimodal Transportation of Goods Act, 1993, the Carriage by Road Act, 2007, or the relevant international convention applicable to that mode of transport, as the case may be.`,
      ],
    },
    {
      heading: "4. No Professional Advice",
      body: [
        "Nothing on this website constitutes legal, customs, tax, or other professional advice. You should seek independent professional advice specific to your shipment before relying on any information provided here.",
      ],
    },
    {
      heading: "5. External Links",
      body: [
        "This website may link to third-party websites for your convenience. We do not endorse and are not responsible for the content or practices of any linked site.",
      ],
    },
    {
      heading: "6. Limitation of Liability",
      body: [
        `To the fullest extent permitted by applicable law, ${COMPANY} disclaims liability for any loss or damage arising from reliance on information published on this website, except as expressly agreed in a confirmed service contract or as required by applicable statute.`,
      ],
    },
  ],
};

export const generalFaqs = [
  {
    question: "How do I request a shipment booking?",
    answer:
      "Create a free client account, sign in, and use the \"Book a Shipment\" form on your dashboard. This submits a request — our team reviews it and reaches out to confirm rates, schedule, and final details before it becomes an active shipment.",
  },
  {
    question: "How is a booking request different from a confirmed shipment?",
    answer:
      "A booking request is you telling us what you need. Nothing is charged or guaranteed at that stage. Once our team contacts you and you both agree on the details, it becomes a confirmed shipment with a tracking ID.",
  },
  {
    question: "How do I track my shipment?",
    answer:
      "Use the \"Track Shipment\" link in the top bar and enter your tracking ID. Some shipments are marked private and will also ask for the last 4 digits of the receiver's registered phone number before showing details.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We operate a multimodal network across India with a strong presence in West Bengal, supporting road, rail, air, and sea freight depending on the route and cargo.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes. Passwords are never stored in plain text, all traffic is encrypted, and access to your data is restricted to authorised staff. See our Privacy Policy for full detail.",
  },
  {
    question: "How do I get a price estimate?",
    answer:
      "Use the \"Get a Quote\" button anywhere on the site and share your origin, destination, and approximate cargo details — our team will respond with pricing.",
  },
  {
    question: "Can I change my cookie preferences after accepting them?",
    answer:
      "Yes, at any time — use the \"Cookie Preferences\" link in the site footer to reopen your preferences and change your choice.",
  },
  {
    question: "Who do I contact for a privacy or data-related concern?",
    answer:
      "Reach our designated Grievance Officer using the contact details listed in Section 11 of our Privacy Policy.",
  },
];
