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

  const quote = await Quote.create(req.body);
  res.status(201).json({ message: "Quote request received", id: quote._id });
}

export async function listQuotes(req, res) {
  const quotes = await Quote.find().sort({ createdAt: -1 }).limit(200);
  res.json(quotes);
}
