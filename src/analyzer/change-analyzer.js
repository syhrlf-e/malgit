import { COMMIT_TYPES, createEmptyScores } from "../constants.js";
import { analyzeFile } from "./file-analyzer.js";

export function analyzeChanges(parsedDiff, config) {
  const fileScores = parsedDiff.files.map((file) => analyzeFile(file, config.scopeMapping));
  const globalScores = createEmptyScores();

  for (const fileScore of fileScores) {
    for (const type of COMMIT_TYPES) {
      globalScores[type] += fileScore.scores[type];
    }
  }

  const dominant = findDominantFile(fileScores);
  const highestScore = Math.max(...Object.values(globalScores));
  const totalScore = Object.values(globalScores).reduce((sum, score) => sum + score, 0);

  return {
    fileScores,
    globalScores,
    dominantFile: dominant?.path ?? "",
    dominantScope: dominant?.scope ?? "",
    confidence: totalScore === 0 ? 0 : Number((highestScore / totalScore).toFixed(2))
  };
}

function findDominantFile(fileScores) {
  return fileScores
    .map((fileScore) => ({
      ...fileScore,
      total: Object.values(fileScore.scores).reduce((sum, score) => sum + score, 0)
    }))
    .sort((a, b) => b.total - a.total)[0];
}
