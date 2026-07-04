import chalk from "chalk";

export interface LoggerRepository {
    log(message: string): void;
    info(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

class Logger implements LoggerRepository {
    log(message: string): void {
        console.log(message);
    }

    info(message: string): void {
        console.log(chalk.blue(`ℹ ${message}`));
    }

    success(message: string): void {
        console.log(chalk.green(`✓ ${message}`));
    }

    warn(message: string): void {
        console.warn(chalk.yellow(`⚠ ${message}`));
    }

    error(message: string): void {
        console.error(chalk.red(`✗ ${message}`));
    }
}

export const logger: LoggerRepository = new Logger();
