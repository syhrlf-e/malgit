export class MalGitError extends Error {
  constructor(message) {
    super(message);
    this.name = "MalGitError";
  }
}

export function formatError(error) {
  if (error instanceof MalGitError) {
    return error.message;
  }

  return `MalGit Error:\n${error.message}`;
}
