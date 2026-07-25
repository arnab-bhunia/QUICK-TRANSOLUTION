import { faq } from "../config/faq";

// Very small, dependency-free keyword matcher: scores each FAQ entry by how
// many of its keywords appear in the user's message, and returns the best
// match if it clears a minimum bar. Good enough for a focused FAQ set;
// swap for a real NLP/embedding match later if the FAQ list grows a lot.
export function matchFaq(message) {
  const text = message.toLowerCase();

  let best = null;
  let bestScore = 0;

  for (const entry of faq) {
    const score = entry.keywords.reduce(
      (count, kw) => (text.includes(kw.toLowerCase()) ? count + 1 : count),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best : null;
}
