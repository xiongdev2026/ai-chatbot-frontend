/**
 * Splits text into words and punctuation, preserving spaces
 */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) || [];
}

/**
 * Compares two texts and returns highlighted words for differences
 * Returns an array of tokens with diff info
 */
export interface DiffToken {
  text: string;
  isDifferent: boolean;
}

export function getDiffHighlight(
  chatbotText: string,
  canonicalText: string
): DiffToken[] {
  if (!canonicalText) {
    return tokenize(chatbotText).map((text) => ({ text, isDifferent: false }));
  }

  const chatbotTokens = tokenize(chatbotText);
  const canonicalTokens = tokenize(canonicalText);

  // Simple word-level comparison: mark tokens not in canonical
  const canonicalSet = new Set(canonicalTokens);

  return chatbotTokens.map((token) => ({
    text: token,
    isDifferent: !canonicalSet.has(token),
  }));
}

/**
 * Alternative: Use Levenshtein distance for fuzzy matching
 * This helps catch slight variations like "ໂມງ" vs "ເວລາ"
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy match tokens with similarity threshold
 */
export function getDiffHighlightFuzzy(
  chatbotText: string,
  canonicalText: string,
  threshold: number = 0.7
): DiffToken[] {
  if (!canonicalText) {
    return tokenize(chatbotText).map((text) => ({ text, isDifferent: false }));
  }

  const chatbotTokens = tokenize(chatbotText);
  const canonicalTokens = tokenize(canonicalText);

  return chatbotTokens.map((token) => {
    const isWhitespace = /^\s+$/.test(token);
    if (isWhitespace) {
      return { text: token, isDifferent: false };
    }

    // Find best match in canonical
    let bestMatch = null;
    let bestSimilarity = threshold;

    for (const canonical of canonicalTokens) {
      if (/^\s+$/.test(canonical)) continue;

      const distance = levenshteinDistance(token, canonical);
      const maxLen = Math.max(token.length, canonical.length);
      const similarity = 1 - distance / maxLen;

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = canonical;
      }
    }

    return {
      text: token,
      isDifferent: bestMatch === null,
    };
  });
}
