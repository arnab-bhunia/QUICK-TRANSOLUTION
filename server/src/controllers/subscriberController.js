import Subscriber from "../models/Subscriber.js";

export async function subscribe(req, res) {
  const { name, email, mobile } = req.body;

  if (!name?.trim() || !email?.trim() || !mobile?.trim()) {
    return res
      .status(400)
      .json({ message: "Name, email and mobile are all required" });
  }

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(200).json({ message: "You're already subscribed" });
  }

  await Subscriber.create({ name, email, mobile });
  res.status(201).json({ message: "Subscribed successfully" });
}
