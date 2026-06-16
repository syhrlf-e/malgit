import { createEmptyScores } from "../constants.js";
import { detectScope } from "./scope-detector.js";

const FIX_KEYWORDS = ["fix", "error", "bug", "validate", "validation", "catch", "fallback"];
const FEAT_KEYWORDS = ["add", "create", "new", "implement", "register", "verify", "verification"];
const PERF_KEYWORDS = ["perf", "optimize", "cache", "memo", "lazy"];

export function analyzeFile(fileChange, scopeMapping) {
  const scores = createEmptyScores();
  const path = fileChange.path.toLowerCase();
  const addedText = normalizeSearchText(fileChange.addedLines.join(" "));

  applyStatusScores(scores, fileChange.status);
  applyPathScores(scores, path);
  applyKeywordScores(scores, addedText);
  applyRatioScores(scores, fileChange);
  applyStyleFallback(scores, fileChange);

  return {
    path: fileChange.path,
    scope: detectScope(fileChange.path, scopeMapping),
    scores
  };
}

function applyStatusScores(scores, status) {
  if (status === "added") scores.feat += 3;
  if (status === "deleted") {
    scores.chore += 2;
    scores.refactor += 2;
  }
  if (status === "renamed") scores.refactor += 2;
}

function applyPathScores(scores, path) {
  if (/(^|\/)(__tests__|tests?|spec)(\/|\.|-|_)/.test(path) || /\.(test|spec)\./.test(path)) {
    scores.test += 4;
  }

  if (path === "readme.md" || path.startsWith("docs/") || path.endsWith(".md")) {
    scores.docs += 4;
  }

  if (path === "package.json") {
    scores.chore += 4;
  }

  if (path.startsWith(".github/workflows/")) {
    scores.ci += 4;
  }
}

function applyKeywordScores(scores, text) {
  if (containsAny(text, FIX_KEYWORDS)) scores.fix += 2;
  if (containsAny(text, FEAT_KEYWORDS)) scores.feat += 2;
  if (containsAny(text, PERF_KEYWORDS)) scores.perf += 2;
}

function applyRatioScores(scores, fileChange) {
  if (fileChange.deletions > 0 && fileChange.deletions / Math.max(fileChange.additions, 1) > 2) {
    scores.refactor += 2;
  }
}

function applyStyleFallback(scores, fileChange) {
  const hasMeaningfulChanges = fileChange.additions > 0 || fileChange.deletions > 0;
  const looksLikeStyleFile = /\.(css|scss|sass|less|prettier|eslint|editorconfig)$/.test(
    fileChange.path.toLowerCase()
  );

  if (!hasMeaningfulChanges || looksLikeStyleFile) {
    scores.style += 3;
  }
}

function containsAny(text, keywords) {
  return keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(text));
}

function normalizeSearchText(text) {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}
