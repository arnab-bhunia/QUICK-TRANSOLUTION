import Quote from "../models/Quote.js";

const REQUIRED_FIELDS = [
  "name",
  "company",
  "contact",
  "email",
  "origin",
  "destination",
  "weight",
];

export async function createQuote(req, res) {
  const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]?.trim?.());
  if (missing.length) {
    return res.status(400).json({
      message: `Missing required field(s): ${missing.join(", ")}`,
    });
  }

  // Explicit field list instead of Quote.create(req.body): the schema has
  // an internal `status` field (default "new", staff-managed workflow
  // state) — passing the raw body through let a submitter include
  // "status": "closed" in their own request and have it saved as-is,
  // silently hiding their own quote from the staff "new quotes" queue.
  const quote = await Quote.create({
    name: req.body.name.trim(),
    company: req.body.company.trim(),
    contact: req.body.contact.trim(),
    email: req.body.email.trim(),
    origin: req.body.origin.trim(),
    destination: req.body.destination.trim(),
    weight: req.body.weight.trim(),
  });
  res.status(201).json({ message: "Quote request received", id: quote._id });
}

export async function listQuotes(req, res) {
  const quotes = await Quote.find().sort({ createdAt: -1 }).limit(200);
  res.json(quotes);
}
