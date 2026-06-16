export function formatSuggestOutput(suggestion) {
  if (suggestion.lowConfidence && suggestion.suggestions.length > 0) {
    return [
      "Possible commit messages:",
      "",
      ...suggestion.suggestions.map((option, index) => `${index + 1}. ${option.message}`)
    ].join("\n");
  }

  return suggestion.message;
}

export function formatExplainOutput({ gitChanges, analysis, suggestion }) {
  return [
    "Changed files:",
    ...gitChanges.files.map((file) => `- ${file.path}`),
    "",
    "Detected changes:",
    ...analysis.fileScores.map((fileScore) => {
      const topType = Object.entries(fileScore.scores).sort((a, b) => b[1] - a[1])[0];
      return `- ${fileScore.path}: ${topType[0]} (${topType[1]})`;
    }),
    "",
    "Score breakdown:",
    ...Object.entries(analysis.globalScores).map(([type, score]) => `- ${type}: ${score}`),
    "",
    "Suggested type:",
    suggestion.type,
    "",
    "Confidence:",
    `${Math.round(analysis.confidence * 100)}%`
  ].join("\n");
}
