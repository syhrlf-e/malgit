import inquirer from "inquirer";
import { formatError, MalGitError } from "../errors.js";
import { createSuggestion } from "../pipeline.js";
import { run } from "../utils/shell.js";
import * as logger from "../utils/logger.js";

export async function runCommitCommand(options) {
  try {
    if (options.yes && options.dryRun) {
      throw new MalGitError("MalGit Error:\n--yes and --dry-run cannot be used together.");
    }

    const { suggestion } = await createSuggestion(options);

    logger.info(`Generated commit message:\n${suggestion.message}`);
    logger.info(`\nCommand preview:\ngit commit -m "${suggestion.message}"`);

    if (options.dryRun) {
      logger.info("\nDry run - no commit was made.");
      return;
    }

    if (!options.yes) {
      const answer = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmed",
          message: "Confirm?",
          default: false
        }
      ]);

      if (!answer.confirmed) {
        logger.info("Commit cancelled.");
        return;
      }
    }

    const commitResult = await run("git", ["commit", "-m", suggestion.message]);

    if (!commitResult.ok) {
      throw new MalGitError(`MalGit Error:\n${commitResult.stderr}`);
    }

    logger.success(commitResult.stdout);
  } catch (error) {
    logger.error(formatError(error));
    process.exitCode = 1;
  }
}
