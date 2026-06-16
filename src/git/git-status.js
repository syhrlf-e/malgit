const STATUS_MAP = {
  A: "added",
  M: "modified",
  D: "deleted",
  R: "renamed",
  C: "added"
};

export function parseStatus(rawStatus) {
  return rawStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const stagedStatus = line[0];
      const worktreeStatus = line[1];
      const pathPart = line.slice(3).trim();
      const path = normalizeStatusPath(pathPart);

      return {
        path,
        status: STATUS_MAP[stagedStatus] ?? STATUS_MAP[worktreeStatus] ?? "modified",
        staged: stagedStatus !== " " && stagedStatus !== "?"
      };
    });
}

function normalizeStatusPath(pathPart) {
  if (pathPart.includes(" -> ")) {
    return pathPart.split(" -> ").at(-1).replaceAll("\\", "/");
  }

  return pathPart.replaceAll("\\", "/");
}
