import { formatError } from "../errors.js";
import { formatExplainOutput } from "../formatter/output-formatter.js";
import { createSuggestion } from "../pipeline.js";
import * as logger from "../utils/logger.js";

export async function runExplainCommand(options) {
  try {
    const result = await createSuggestion(options);
    logger.info(formatExplainOutput(result));
  } catch (error) {
    logger.error(formatError(error));
    process.exitCode = 1;
  }
}
