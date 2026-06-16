import { PRIORITY_ORDER } from "../constants.js";

export const HIGH_CONFIDENCE_THRESHOLD = 0.7;

export function classifyCommit(analysis) {
  const effectiveScores = resolveEffectiveScores(analysis);
  const rankedTypes = rankTypes(effectiveScores);
  const topType = rankedTypes[0]?.type ?? "chore";
  const confidence = calculateConfidence(effectiveScores);

  return {
    type: topType,
    scope: findScopeForType(analysis, topType),
    confidence,
    lowConfidence: confidence < HIGH_CONFIDENCE_THRESHOLD,
    rankedTypes
  };
}

function resolveEffectiveScores(analysis) {
  const scores = { ...analysis.globalScores };
  const implementationTypes = ["feat", "fix", "perf", "refactor"];
  const strongestImplementation = implementationTypes
    .map((type) => ({ type, score: scores[type] ?? 0 }))
    .sort((a, b) => b.score - a.score)[0];
  const hasImplementationFile = (analysis.fileScores ?? []).some((fileScore) => {
    return !isDocsPath(fileScore.path) && implementationTypes.some((type) => fileScore.scores[type] > 0);
  });

  if ((scores.docs ?? 0) > 0 && hasImplementationFile && strongestImplementation?.score > 0) {
    scores.docs = Math.min(scores.docs, Math.max(strongestImplementation.score - 1, 0));
  }

  return scores;
}

export function rankTypes(scores) {
  return Object.entries(scores)
    .map(([type, score]) => ({
      type,
      score,
      priority: PRIORITY_ORDER.indexOf(type)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.priority - b.priority);
}

function findScopeForType(analysis, type) {
  const strongestFile = [...(analysis.fileScores ?? [])]
    .filter((fileScore) => fileScore.scores[type] > 0)
    .sort((a, b) => b.scores[type] - a.scores[type])[0];

  return strongestFile?.scope ?? analysis.dominantScope;
}

function calculateConfidence(scores) {
  const highestScore = Math.max(...Object.values(scores));
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return totalScore === 0 ? 0 : Number((highestScore / totalScore).toFixed(2));
}

function isDocsPath(path) {
  const normalizedPath = path.toLowerCase();
  return normalizedPath === "readme.md" || normalizedPath.startsWith("docs/") || normalizedPath.endsWith(".md");
}
