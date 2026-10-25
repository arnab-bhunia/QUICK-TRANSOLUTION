import { faq } from "../config/faq";

// --------------------------------------------------
// 1. Normalize user messages and FAQ keywords
// --------------------------------------------------

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// --------------------------------------------------
// 2. Greeting and conversational responses
// --------------------------------------------------

const conversationalResponses = {
  hi: "Hello! Welcome to Quick Transolution. How can I help you today?",
  hello:
    "Hello! Welcome to Quick Transolution. How can I assist you today?",
  hey: "Hey! Welcome to Quick Transolution. What would you like to know?",
  "hi there":
    "Hello! Welcome to Quick Transolution. How can I help you?",
  "hello there":
    "Hello! How can I assist you with our services today?",
  "hey there":
    "Hey there! What would you like to know about Quick Transolution?",
  "good morning":
    "Good morning! Welcome to Quick Transolution. How can I help you today?",
  "good afternoon":
    "Good afternoon! How can I assist you today?",
  "good evening":
    "Good evening! How can I help you today?",
  "how are you":
    "I am doing well, thank you! How can I help you today?",
  "who are you":
    "I am the Quick Transolution virtual assistant. I can help you explore our services, shipment tracking, careers, resources, and other website information.",
  "what can you do":
    "I can help you learn about our logistics services, track shipments, explore resources, find career information, and contact our team.",
  thanks:
    "You are welcome! I am happy to help.",
  "thank you":
    "You are welcome! Please let me know if you need any further assistance.",
  "thank you so much":
    "You are very welcome! I am glad I could help.",
  bye:
    "Thank you for visiting Quick Transolution. Have a great day!",
  goodbye:
    "Goodbye! Thank you for visiting Quick Transolution. Have a great day!",
};

// --------------------------------------------------
// 3. Match conversational messages safely
// --------------------------------------------------

function matchConversation(text) {
  if (conversationalResponses[text]) {
    return {
      id: "conversation_" + text.replace(/\s+/g, "_"),
      keywords: [text],
      answer: conversationalResponses[text],
      links: [],
    };
  }

  return null;
}

// --------------------------------------------------
// 4. Extract meaningful words
// --------------------------------------------------

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "was",
  "were",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "their",
  "it",
  "its",
  "he",
  "she",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "from",
  "with",
  "about",
  "please",
  "tell",
  "know",
  "want",
  "would",
  "could",
  "should",
  "can",
  "will",
  "me",
  "there",
  "this",
  "that",
  "these",
  "those",
  "some",
  "any",
  "much",
  "many",
  "more",
  "very",
  "really",
  "just",
]);

function getMeaningfulWords(text) {
  return text
    .split(" ")
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

// --------------------------------------------------
// 5. Identify the user's question intent
// --------------------------------------------------

const INTENT_PATTERNS = {
  tracking: [
    "track",
    "tracking",
    "shipment status",
    "delivery status",
    "where is my shipment",
    "where is my parcel",
    "consignment status",
  ],

  services: [
    "service",
    "services",
    "logistics",
    "transport",
    "transportation",
    "freight",
    "cargo",
  ],

  careers: [
    "job",
    "jobs",
    "career",
    "careers",
    "vacancy",
    "vacancies",
    "recruitment",
    "hiring",
    "apply for a job",
  ],

  resources: [
    "resource",
    "resources",
    "publication",
    "publications",
    "report",
    "reports",
    "article",
    "articles",
    "blog",
    "blogs",
    "company news",
  ],

  contact: [
    "contact",
    "phone number",
    "email address",
    "customer support",
    "customer care",
    "reach your team",
    "talk to someone",
  ],

  quotation: [
    "quote",
    "quotation",
    "estimate",
    "pricing",
    "price",
    "cost",
    "shipping charges",
    "transport charges",
  ],
};

function detectIntents(text) {
  const detected = new Set();

  for (const [intent, phrases] of Object.entries(INTENT_PATTERNS)) {
    for (const phrase of phrases) {
      if (containsPhrase(text, normalizeText(phrase))) {
        detected.add(intent);
        break;
      }
    }
  }

  return detected;
}

// --------------------------------------------------
// 6. Match whole phrases rather than partial words
// --------------------------------------------------

function containsPhrase(text, phrase) {
  if (!text || !phrase) {
    return false;
  }

  return ` ${text} `.includes(` ${phrase} `);
}

// --------------------------------------------------
// 7. Score an FAQ entry
// --------------------------------------------------

function scoreFaqEntry(entry, normalizedMessage, messageWords, messageIntents) {
  if (!Array.isArray(entry.keywords) || entry.keywords.length === 0) {
    return 0;
  }

  let score = 0;
  const matchedPhrases = new Set();

  for (const originalKeyword of entry.keywords) {
    const keyword = normalizeText(originalKeyword);

    if (!keyword) {
      continue;
    }

    // A full phrase is stronger evidence than an individual word.

    if (containsPhrase(normalizedMessage, keyword)) {
      if (!matchedPhrases.has(keyword)) {
        const wordCount = keyword.split(" ").length;

        score += wordCount >= 4 ? 9 : wordCount === 3 ? 7 : wordCount === 2 ? 5 : 3;

        matchedPhrases.add(keyword);
      }

      continue;
    }

    // If the full phrase does not match, compare its individual words.

    const keywordWords = getMeaningfulWords(keyword);

    if (keywordWords.length === 0) {
      continue;
    }

    let matchedWords = 0;

    for (const word of keywordWords) {
      if (messageWords.has(word)) {
        matchedWords++;
      }
    }

    if (matchedWords > 0) {
      const coverage = matchedWords / keywordWords.length;

      score += coverage * (keywordWords.length > 1 ? 2.5 : 1.5);
    }
  }

  // Add a modest bonus when the FAQ and question share a clear intent.

  const entryId = normalizeText(entry.id || "");

  for (const intent of messageIntents) {
    const relatedWords = INTENT_PATTERNS[intent] || [];

    const matchesIntent =
      relatedWords.some((phrase) =>
        entryId.includes(normalizeText(phrase))
      ) ||
      (Array.isArray(entry.keywords) &&
        entry.keywords.some((keyword) => {
          const normalizedKeyword = normalizeText(keyword);

          return relatedWords.some(
            (phrase) => normalizedKeyword === normalizeText(phrase)
          );
        }));

    if (matchesIntent) {
      score += 1.5;
    }
  }

  return score;
}

// --------------------------------------------------
// 8. Main FAQ matcher
// --------------------------------------------------

export function matchFaq(message) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return null;
  }

  // Greetings and common conversational messages are handled first.

  const conversationMatch = matchConversation(normalizedMessage);

  if (conversationMatch) {
    return conversationMatch;
  }

  const messageWords = new Set(getMeaningfulWords(normalizedMessage));
  const messageIntents = detectIntents(normalizedMessage);

  const rankedResults = [];

  for (const entry of faq) {
    const score = scoreFaqEntry(
      entry,
      normalizedMessage,
      messageWords,
      messageIntents
    );

    if (score > 0) {
      rankedResults.push({
        entry,
        score,
      });
    }
  }

  if (rankedResults.length === 0) {
    return null;
  }

  rankedResults.sort((a, b) => b.score - a.score);

  const best = rankedResults[0];
  const secondBest = rankedResults[1];

  /*
   * Require meaningful evidence before answering.
   * Longer keyword phrases receive stronger scores.
   */

  const MINIMUM_SCORE = 3;

  if (best.score < MINIMUM_SCORE) {
    return null;
  }

  /*
   * Avoid weak matches when two different FAQs have almost
   * identical scores. Strong exact phrase matches are allowed.
   */

  if (
    secondBest &&
    best.score - secondBest.score < 1 &&
    best.score < 7
  ) {
    return null;
  }

  // Return the original FAQ entry, including links and metadata.

  return best.entry;
}