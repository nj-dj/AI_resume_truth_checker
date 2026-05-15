const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "must",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "we",
  "they",
  "he",
  "she",
  "it",
  "our",
  "your",
  "their",
  "my",
  "me",
  "us",
  "them",
  "who",
  "whom",
  "which",
  "what",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "into",
  "about",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "any",
  "if",
  "because",
  "while",
  "own",
  "using",
  "including",
  "years",
  "year",
  "experience",
  "work",
  "team",
  "skills",
  "ability",
  "strong",
  "excellent",
  "good",
  "looking",
  "seeking",
  "opportunity",
]);

const tokenize = (text) => {
  const normalized = text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
  return normalized
    .split(/\s+/)
    .map((t) => t.replace(/^[-.]+|[-.]+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
};

const uniqueKeywords = (tokens, limit = 80) => {
  const seen = new Set();
  const out = [];

  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= limit) break;
  }

  return out;
};

export const extractKeywordCandidates = (jobDescription) => {
  const tokens = tokenize(jobDescription);
  return uniqueKeywords(tokens, 100);
};

export const scoreKeywordCoverage = (resumeText, keywords) => {
  const resumeLower = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const kw of keywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  if (!keywords.length) {
    return { score: 0, matched, missing };
  }

  const ratio = matched.length / keywords.length;
  return { score: Math.round(ratio * 100), matched, missing };
};

export const detectFormattingSignals = (resumeText) => {
  const issues = [];
  const len = resumeText.length;
  const newlines = (resumeText.match(/\n/g) ?? []).length;

  if (len < 120) {
    issues.push({
      id: "sparse_text",
      severity: "high",
      message: "Extracted text is very short. Scanned PDFs with heavy graphics may hide content from ATS parsers.",
    });
  }

  if (len > 400 && newlines / len < 0.01) {
    issues.push({
      id: "dense_layout",
      severity: "medium",
      message: "Low line-break density can indicate complex columns or text boxes that confuse ATS parsers.",
    });
  }

  if (/[|]{3,}/.test(resumeText)) {
    issues.push({
      id: "table_like_separators",
      severity: "medium",
      message: "Repeated pipe characters often come from tables and may reorder incorrectly in ATS systems.",
    });
  }

  return issues;
};
