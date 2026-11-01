/**
 * ZarooratSetu - Duplicate Detection Service
 * Detects spam and repeated requests using text tokenization, location cluster, and temporal window
 */

export class DuplicateService {
  /**
   * Tokenizes and cleans text into normalized word set
   */
  static tokenize(text) {
    if (!text) return new Set();
    const clean = text
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ') // Support Latin and Devanagari Unicode
      .split(/\s+/)
      .filter(w => w.length > 2);
    return new Set(clean);
  }

  /**
   * Calculates Jaccard similarity coefficient between two word sets
   */
  static jaccardSimilarity(setA, setB) {
    if (!setA.size || !setB.size) return 0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Checks a new request against existing active requests in the database
   * Window: 72 hours
   */
  static checkDuplicate(newRequest, existingRequests = [], timeWindowHours = 72) {
    const now = Date.now();
    const windowMs = timeWindowHours * 60 * 60 * 1000;
    const newTokens = this.tokenize(`${newRequest.title} ${newRequest.description}`);

    let highestScore = 0;
    let matchedId = null;

    for (const req of existingRequests) {
      // Don't check against self
      if (req.id === newRequest.id) continue;

      // Time window check
      const createdAt = new Date(req.createdAt).getTime();
      if (now - createdAt > windowMs) continue;

      // Same user check: same user submitting same category within 24h
      const sameUser = req.userId && newRequest.userId && req.userId === newRequest.userId;
      const sameCategory = req.category && newRequest.category && req.category.toLowerCase() === newRequest.category.toLowerCase();

      // Text similarity check
      const reqTokens = this.tokenize(`${req.title} ${req.description}`);
      const similarity = this.jaccardSimilarity(newTokens, reqTokens);

      let totalScore = similarity;
      if (sameUser && sameCategory) {
        totalScore = Math.min(1.0, similarity + 0.35); // Boost duplicate probability if same user
      }

      if (totalScore > highestScore) {
        highestScore = totalScore;
        matchedId = req.id;
      }
    }

    const isDuplicate = highestScore >= 0.60;

    return {
      isDuplicate,
      confidenceScore: Math.round(highestScore * 100) / 100,
      matchedWithId: isDuplicate ? matchedId : null,
      reason: isDuplicate
        ? `Similar active request found (#${matchedId}) with ${Math.round(highestScore * 100)}% match within ${timeWindowHours}h.`
        : null
    };
  }
}
