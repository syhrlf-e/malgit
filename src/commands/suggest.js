import { formatError } from "../errors.js";
import { formatSuggestOutput } from "../formatter/output-formatter.js";
import { createSuggestion } from "../pipeline.js";
import * as logger from "../utils/logger.js";

export async function runSuggestCommand(options) {
  try {
    const { suggestion } = await createSuggestion(options);
    logger.info(formatSuggestOutput(suggestion));
  } catch (error) {
    logger.error(formatError(error));
    process.exitCode = 1;
  }
}
