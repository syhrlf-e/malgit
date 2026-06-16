export function detectScope(filePath, scopeMapping = {}) {
  const normalizedPath = filePath.replaceAll("\\", "/");
  const matchedEntry = Object.entries(scopeMapping)
    .sort(([a], [b]) => b.length - a.length)
    .find(([prefix]) => normalizedPath.startsWith(prefix));

  if (matchedEntry) {
    return matchedEntry[1];
  }

  const srcMatch = normalizedPath.match(/^src\/([^/]+)\//);
  if (srcMatch) {
    return srcMatch[1];
  }

  const readmeMatch = normalizedPath.match(/(^|\/)README(\.md)?$/i);
  if (readmeMatch) {
    return "readme";
  }

  return "";
}
