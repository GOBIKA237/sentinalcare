/**
 * PLACEHOLDER sentiment scorer, standing in for a real NLP/LLM-based service
 * so the app is demo-able end to end before that service exists.
 *
 * Swap this out for a real HTTP call once a scoring service is up:
 *
 *   const res = await fetch(`${process.env.SENTIMENT_SERVICE_URL}/score`, {
 *     method: "POST", headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ messages: plaintextMessages })
 *   });
 *   return res.json(); // { sentiment, band }
 *
 * IMPORTANT: whatever computes the real score necessarily sees plaintext
 * message content to do so — that's expected and fine as long as it happens
 * in a single, narrow, server-side step whose OUTPUT (a number + band) is
 * all that ever gets persisted or returned to a welfare_officer. Never widen
 * this function's return value to include raw text.
 *
 * This heuristic just scores each user message by simple keyword presence
 * and averages. Good enough to light up the dashboard for a demo; not a
 * real clinical or NLP model.
 */

const NEGATIVE_WORDS = [
  "tired", "exhausted", "stressed", "anxious", "worried", "overwhelmed",
  "sad", "angry", "frustrated", "hopeless", "alone", "can't sleep",
  "not sleeping", "no sleep", "burnt out", "burned out",
];

const POSITIVE_WORDS = [
  "good", "fine", "great", "happy", "calm", "rested", "okay", "ok",
  "better", "well", "relaxed", "confident",
];

/**
 * @param {string[]} userMessages - plaintext content of role:'user' messages
 *   for one chat session, already decrypted by the caller for this single
 *   scoring pass. Never persisted or logged as-is.
 * @returns {{ sentiment: number, band: 'positive'|'neutral'|'negative' }}
 *   sentiment is in [-1, 1], -1 most negative.
 */
function scoreFromMessages(userMessages) {
  if (!userMessages || userMessages.length === 0) {
    return { sentiment: 0, band: "neutral" };
  }

  let hits = 0;
  let scoreSum = 0;

  for (const raw of userMessages) {
    const text = String(raw).toLowerCase();
    let messageScore = 0;
    for (const word of NEGATIVE_WORDS) {
      if (text.includes(word)) {
        messageScore -= 1;
        hits += 1;
      }
    }
    for (const word of POSITIVE_WORDS) {
      if (text.includes(word)) {
        messageScore += 1;
        hits += 1;
      }
    }
    scoreSum += messageScore;
  }

  if (hits === 0) {
    return { sentiment: 0, band: "neutral" };
  }

  const sentiment = Math.max(-1, Math.min(1, scoreSum / hits));
  const band = sentiment <= -0.2 ? "negative" : sentiment >= 0.2 ? "positive" : "neutral";

  return { sentiment: Number(sentiment.toFixed(3)), band };
}

module.exports = { scoreFromMessages };
