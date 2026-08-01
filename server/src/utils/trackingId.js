import { customAlphabet } from "nanoid";
import Shipment from "../models/Shipment.js";

// Alphabet deliberately excludes visually-confusable characters (0/O,
// 1/I/L) since these IDs get read aloud over phone/SMS by customers.
// A 10-char ID from this 32-character alphabet has ~50 bits of entropy —
// this is what makes IDs non-guessable (see the earlier security
// discussion: sequential IDs are what enable enumeration attacks).
const nanoid = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 10);

export async function generateTrackingId() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `QT${nanoid()}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await Shipment.exists({ trackingId: id });
    if (!exists) return id;
  }
  throw new Error("Could not generate a unique tracking ID — please retry.");
}
