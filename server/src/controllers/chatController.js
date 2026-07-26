import ChatQuery from "../models/ChatQuery.js";

export async function createUnansweredQuery(req, res) {
  const { question, contact } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ message: "A question is required" });
  }

  const entry = await ChatQuery.create({
    question: question.trim(),
    contact: contact?.trim() || "",
  });

  res.status(201).json({ message: "Question received", id: entry._id });
}

// Lists queries newest first, for a future admin view.
export async function listUnansweredQueries(req, res) {
  const queries = await ChatQuery.find().sort({ createdAt: -1 }).limit(200);
  res.json(queries);
}
