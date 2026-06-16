import { PRIORITY_ORDER } from "../constants.js";

export const HIGH_CONFIDENCE_THRESHOLD = 0.7;

export function classifyCommit(analysis) {
  const rankedTypes = rankTypes(analysis.globalScores);
  const topType = rankedTypes[0]?.type ?? "chore";

  return {
    type: topType,
    scope: findScopeForType(analysis, topType),
    confidence: analysis.confidence,
    lowConfidence: analysis.confidence < HIGH_CONFIDENCE_THRESHOLD,
    rankedTypes
  };
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
