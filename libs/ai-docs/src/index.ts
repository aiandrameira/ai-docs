#!/usr/bin/env node
import { Command } from "commander";

import { runBuild } from "./commands/build";
import { runDev } from "./commands/dev";
import { runInit } from "./commands/init";
import { logger } from "./config/logger";
import { loadPackageInfo } from "./config/package-info";

const pkg = loadPackageInfo();

async function runAction(action: () => Promise<void>): Promise<void> {
    try {
        await action();
    } catch (err) {
        logger.error((err as Error).message);
        process.exit(1);
    }
}

const program = new Command();

program.name("ai-docs").description("Static documentation generator for TypeScript projects").version(pkg.version);

program
    .command("build")
    .description("Generate the static site from docs/")
    .option("-c, --config <path>", "Path to config file", "ai-docs.config.ts")
    .action(async (opts: { config: string }) => {
        await runAction(async () => {
            const { loadConfig } = await import("./config/loader");
            const config = await loadConfig(opts.config);
            await runBuild(config as never);
        });
    });

program
    .command("dev")
    .description("Start dev server with watch mode and live reload")
    .option("-c, --config <path>", "Path to config file", "ai-docs.config.ts")
    .option("-p, --port <number>", "Port for the dev server", "4000")
    .action(async (opts: { config: string; port: string }) => {
        await runAction(async () => {
            const { loadConfig } = await import("./config/loader");
            const config = await loadConfig(opts.config);
            await runDev(config as never, parseInt(opts.port, 10));
        });
    });

program
    .command("init")
    .description("Scaffold docs/ directory and ai-docs.config.ts")
    .argument("[dir]", "Target directory", ".")
    .action(async (dir: string) => {
        await runAction(() => runInit(dir));
    });

program.parseAsync(process.argv);
