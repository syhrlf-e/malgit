const LOCK_FILES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]);

export function parseDiff(rawDiff, statusFiles = []) {
  const statusByPath = new Map(statusFiles.map((file) => [file.path, file]));
  const files = [];
  let currentFile = null;

  for (const line of rawDiff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      if (currentFile) files.push(currentFile);
      currentFile = createFileChange(line, statusByPath);
      continue;
    }

    if (!currentFile) continue;

    if (line.startsWith("+++ b/")) {
      currentFile.path = line.slice(6).replaceAll("\\", "/");
      currentFile.status = statusByPath.get(currentFile.path)?.status ?? currentFile.status;
      continue;
    }

    if (line.startsWith("new file mode")) {
      currentFile.status = "added";
      continue;
    }

    if (line.startsWith("deleted file mode")) {
      currentFile.status = "deleted";
      continue;
    }

    if (line.startsWith("rename to ")) {
      currentFile.path = line.slice("rename to ".length).replaceAll("\\", "/");
      currentFile.status = "renamed";
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      collectMeaningfulLine(currentFile, "addedLines", line.slice(1));
      continue;
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      collectMeaningfulLine(currentFile, "removedLines", line.slice(1));
    }
  }

  if (currentFile) files.push(currentFile);

  return {
    files: filterLockFiles(mergeStatusOnlyFiles(files, statusFiles))
  };
}

function createFileChange(diffHeader, statusByPath) {
  const path = diffHeader.split(" b/").at(-1)?.trim().replaceAll("\\", "/") ?? "";
  const status = statusByPath.get(path)?.status ?? "modified";

  return {
    path,
    status,
    additions: 0,
    deletions: 0,
    addedLines: [],
    removedLines: []
  };
}

function collectMeaningfulLine(fileChange, key, line) {
  if (!isMeaningfulLine(line)) return;

  fileChange[key].push(line.trim());

  if (key === "addedLines") {
    fileChange.additions += 1;
  } else {
    fileChange.deletions += 1;
  }
}

export function isMeaningfulLine(line) {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("#")) return false;
  if (trimmed.startsWith("/*")) return false;
  if (trimmed.startsWith("*")) return false;
  if (trimmed.startsWith("*/")) return false;
  if (/^import\s.+from\s+["'].+["'];?$/.test(trimmed)) return false;
  if (/^import\s+["'].+["'];?$/.test(trimmed)) return false;
  if (/^export\s+\{.*\}\s+from\s+["'].+["'];?$/.test(trimmed)) return false;

  return true;
}

function mergeStatusOnlyFiles(parsedFiles, statusFiles) {
  const paths = new Set(parsedFiles.map((file) => file.path));
  const statusOnlyFiles = statusFiles
    .filter((file) => !paths.has(file.path))
    .map((file) => ({
      path: file.path,
      status: file.status,
      additions: 0,
      deletions: 0,
      addedLines: [],
      removedLines: []
    }));

  return [...parsedFiles, ...statusOnlyFiles];
}

function filterLockFiles(files) {
  const nonLockFiles = files.filter((file) => !LOCK_FILES.has(file.path));
  return nonLockFiles.length > 0 ? nonLockFiles : files;
}
