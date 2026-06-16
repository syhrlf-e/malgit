import { createEmptyScores } from "../constants.js";
import { detectScope } from "./scope-detector.js";

const FIX_KEYWORDS = ["fix", "error", "bug", "validate", "validation", "catch", "fallback"];
const FEAT_KEYWORDS = ["add", "create", "implement", "register", "verify", "verification"];
const PERF_KEYWORDS = ["perf", "optimize", "cache", "memo", "lazy"];
const CLI_HELP_PATTERNS = [
  /\.addHelpText\b/,
  /\.helpOption\b/,
  /\.showHelpAfterError\b/,
  /\.usage\b/,
  /\bUsage:/,
  /\bExamples?:/,
  /\bWorkflow:/
];

export function analyzeFile(fileChange, scopeMapping) {
  const scores = createEmptyScores();
  const path = fileChange.path.toLowerCase();
  const addedText = normalizeSearchText(fileChange.addedLines.join(" "));

  applyStatusScores(scores, fileChange.status);
  applyPathScores(scores, path);
  applyKeywordScores(scores, addedText);
  applyRatioScores(scores, fileChange);
  applyStyleFallback(scores, fileChange);
  applyCoreLogicFallback(scores, fileChange);
  applyCliHelpFallback(scores, fileChange);

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
    scores.test += 8;
  }

  if (path === "readme.md" || path.startsWith("docs/") || path.endsWith(".md")) {
    scores.docs += 8;
  }

  if (path === "package.json") {
    scores.chore += 8;
  }

  if (path.startsWith(".github/workflows/")) {
    scores.ci += 8;
  }
}

function applyKeywordScores(scores, text) {
  scores.fix += countMatches(text, FIX_KEYWORDS) * 3;
  if (containsAny(text, FEAT_KEYWORDS)) scores.feat += 2;
  if (containsAny(text, PERF_KEYWORDS)) scores.perf += 8;
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
    scores.style += 8;
  }
}

function applyCoreLogicFallback(scores, fileChange) {
  const path = fileChange.path.toLowerCase();
  const hasMeaningfulChanges = fileChange.additions > 0 || fileChange.deletions > 0;
  const hasScore = Object.values(scores).some((score) => score > 0);
  const isCoreLogicFile = /src\/(analyzer|classifier|generator)\//.test(path);

  if (hasMeaningfulChanges && !hasScore && isCoreLogicFile) {
    scores.feat += 3;
  }
}

function applyCliHelpFallback(scores, fileChange) {
  const path = fileChange.path.toLowerCase();
  const changedText = [...fileChange.addedLines, ...fileChange.removedLines].join(" ");
  const isCliEntrypoint = path === "src/index.js" || path.startsWith("bin/");

  if (isCliEntrypoint && CLI_HELP_PATTERNS.some((pattern) => pattern.test(changedText))) {
    scores.feat += 8;
    scores.fix = Math.max(0, scores.fix - 3);
  }
}

function containsAny(text, keywords) {
  return keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(text));
}

function countMatches(text, keywords) {
  return keywords.filter((keyword) => new RegExp(`\\b${keyword}\\b`, "i").test(text)).length;
}

function normalizeSearchText(text) {
  return text
    .replace(/\b[a-zA-Z_$][\w$]*\.(feat|fix|docs|style|refactor|test|chore|perf|ci)\b/g, " ")
    .replace(/\b[A-Z]+_KEYWORDS\b/g, " ")
    .replace(/\/(?:\\.|[^/\\\r\n])+\/[a-z]*/g, " ")
    .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}
