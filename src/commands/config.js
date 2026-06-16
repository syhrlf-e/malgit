import { readConfig } from "../config/config-reader.js";
import { setConfigValue } from "../config/config-writer.js";
import { formatError } from "../errors.js";
import * as logger from "../utils/logger.js";

export async function runConfigCommand({ action, key, value }) {
  try {
    if (action === "set") {
      const config = await setConfigValue(key, value);
      logger.success(`Config updated: ${key} = ${JSON.stringify(config[key])}`);
      return;
    }

    const config = await readConfig();

    if (action === "get" && key) {
      logger.info(JSON.stringify(config[key], null, 2));
      return;
    }

    logger.info(JSON.stringify(config, null, 2));
  } catch (error) {
    logger.error(formatError(error));
    process.exitCode = 1;
  }
}
