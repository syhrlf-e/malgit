import chalk from "chalk";

export function error(message) {
  console.error(chalk.red(message));
}

export function info(message) {
  console.log(message);
}

export function muted(message) {
  console.log(chalk.gray(message));
}

export function success(message) {
  console.log(chalk.green(message));
}
