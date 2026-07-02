import chalk from "chalk";
import * as fs from "fs";
import * as http from "http";
import * as path from "path";

import { logger } from "../config/logger";
import { spinner } from "../config/spinner";
import { runBuild } from "./build";

import type { SiteConfig } from "../../../core";

const LIVE_RELOAD_SCRIPT = `<script>
(function(){
  var es=new EventSource('/__live');
  es.onmessage=function(){location.reload();};
  es.onerror=function(){setTimeout(function(){location.reload();},1500);};
})();
</script>`;

const MIME: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".map": "application/json",
};

export async function runDev(config: SiteConfig, port = 4000): Promise<void> {
    const outRoot = path.resolve(config.output ?? "./dist");
    const docsRoot = path.resolve(config.docs ?? "./docs");
    const configFile = path.resolve("ai-docs.config.ts");

    const clients: http.ServerResponse[] = [];

    const notify = () => {
        for (const client of clients) {
            client.write("data: reload\n\n");
        }
    };

    const serveFile = (filePath: string, res: http.ServerResponse) => {
        const ext = path.extname(filePath);
        const mime = MIME[ext] ?? "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime });

        if (ext === ".html") {
            let html = fs.readFileSync(filePath, "utf-8");
            html = html.replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`);
            res.end(html);
        } else {
            fs.createReadStream(filePath).pipe(res);
        }
    };

    const server = http.createServer((req, res) => {
        const rawUrl = req.url ?? "/";
        const url = rawUrl.split("?")[0];

        if (url === "/__live") {
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(": connected\n\n");
            clients.push(res);
            req.on("close", () => {
                const idx = clients.indexOf(res);
                if (idx !== -1) clients.splice(idx, 1);
            });
            return;
        }

        let filePath = path.join(outRoot, url === "/" ? "index.html" : url);

        if (!path.extname(filePath)) {
            filePath = path.join(filePath, "index.html");
        }

        if (fs.existsSync(filePath)) {
            serveFile(filePath, res);
            return;
        }

        const rootIndex = path.join(outRoot, "index.html");
        if (fs.existsSync(rootIndex)) {
            serveFile(rootIndex, res);
            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`Not found: ${url}`);
    });

    logger.log("\n  AI-Docs Dev Server\n");
    try {
        await runBuild(config, { quiet: false });
    } catch (err) {
        logger.error(`Initial build failed: ${(err as Error).message}`);
    }

    server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
            logger.error(`Port ${port} is already in use. Run with a different port: --port ${port + 1}`);
        } else {
            logger.error(`Server error: ${err.message}`);
        }
        process.exit(1);
    });

    server.listen(port, () => {
        logger.log(`\n  ➜  Local:   ${chalk.cyan(`http://localhost:${port}/`)}`);
        logger.log(`\n  Watching:  ${docsRoot}`);
        if (fs.existsSync(configFile)) logger.log(`  Config:    ${configFile}`);
        logger.log("\n  Press Ctrl+C to stop.\n");
    });

    const { watch } = await import("chokidar");

    let rebuilding = false;

    const watchPaths = [docsRoot];
    if (fs.existsSync(configFile)) watchPaths.push(configFile);

    const watcher = watch(watchPaths, {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    });

    const rebuild = async (changed: string) => {
        if (rebuilding) return;

        rebuilding = true;
        const rel = path.relative(process.cwd(), changed);
        const rebuildSpinner = spinner(`↻ ${rel}`);
        rebuildSpinner.start();

        try {
            await runBuild(config, { quiet: true });
            rebuildSpinner.succeed("Rebuilt");
            notify();
        } catch (err) {
            rebuildSpinner.fail(`Build error: ${(err as Error).message}`);
        } finally {
            rebuilding = false;
        }
    };

    watcher.on("change", rebuild);
    watcher.on("add", rebuild);
    watcher.on("unlink", rebuild);

    process.on("SIGINT", () => {
        logger.log("\n  Stopping dev server...\n");
        watcher.close();
        server.close(() => process.exit(0));
    });
}
