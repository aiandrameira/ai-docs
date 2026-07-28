import * as fs from "fs";
import * as path from "path";

export interface AssetManifest {
    cssFile: string | null;
    jsFiles: string[];
    preloadFiles: string[];
}

export function makeAssetManifest(raw: Partial<AssetManifest> = {}): AssetManifest {
    return {
        cssFile: raw.cssFile ?? null,
        jsFiles: raw.jsFiles ?? [],
        preloadFiles: raw.preloadFiles ?? [],
    };
}

export function resolveAngularBrowserDir(cwd: string = process.cwd()): string | null {
    const devDir = path.join(cwd, "dist", "apps", "web", "browser");
    if (fs.existsSync(devDir)) return devDir;

    const bundledDir = path.resolve(__dirname, "web", "browser");
    if (fs.existsSync(bundledDir)) return bundledDir;

    return null;
}

export async function copyAngularAssets(outRoot: string, cwd: string = process.cwd()): Promise<AssetManifest | null> {
    const angularBuildDir = resolveAngularBrowserDir(cwd);

    if (!angularBuildDir) return null;

    const assetsDir = path.join(outRoot, "assets");
    fs.mkdirSync(assetsDir, { recursive: true });

    const manifest: AssetManifest = makeAssetManifest();

    const entries = fs.readdirSync(angularBuildDir, { withFileTypes: true });

    const assetRegex = /\.(woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp)$/;

    const copyToAssets = (src: string, name: string) => {
        fs.copyFileSync(src, path.join(assetsDir, name));
    };

    const copyToRoot = (src: string, name: string) => {
        fs.copyFileSync(src, path.join(outRoot, name));
    };

    const rules = [
        {
            match: (name: string) => /^styles(-[A-Z0-9]+)?\.css$/i.test(name),
            run: (src: string) => {
                copyToAssets(src, "styles.css");
                manifest.cssFile = "assets/styles.css";
            },
        },
        {
            match: (name: string) => /^main(-[A-Z0-9]+)?\.js$/i.test(name),
            run: (src: string, name: string) => {
                copyToRoot(src, name);
            },
        },
        {
            match: (name: string) => name.startsWith("chunk-") && name.endsWith(".js"),
            run: (src: string, name: string) => {
                // Copied so lazy dynamic import()s can resolve them at runtime, but NOT
                // added to the manifest here: most of these chunks are route/feature-lazy
                // (e.g. per-language syntax highlighting grammars) and must stay lazy.
                // Which ones are actually needed eagerly is decided below from Angular's
                // own generated index.csr.html, not by guessing from the filename.
                copyToRoot(src, name);
            },
        },
        {
            match: (name: string) => /^favicon\.(ico|png|svg)$/i.test(name),
            run: (src: string, name: string) => {
                copyToRoot(src, name);
            },
        },
    ];

    for (const entry of entries) {
        const name = entry.name;
        const src = path.join(angularBuildDir, name);

        if (entry.isDirectory()) {
            copyDir(src, path.join(assetsDir, name));
            continue;
        }

        const rule = rules.find(rule => rule.match(name));

        if (rule) {
            rule.run(src, name);
            continue;
        }

        if (assetRegex.test(name)) {
            copyToAssets(src, name);
        }
    }

    const { jsFiles, preloadFiles } = readEntryScripts(angularBuildDir);
    manifest.jsFiles = jsFiles;
    manifest.preloadFiles = preloadFiles;

    return manifest;
}

/**
 * Angular's own build already knows exactly which chunks are needed eagerly
 * to bootstrap the app (usually just main.js + a runtime chunk) vs. which are
 * lazy (routes/features fetched on demand). That distinction lives in the
 * generated index.csr.html <script>/<link rel="modulepreload"> tags — read it
 * from there instead of treating every chunk-*.js file as eager, which would
 * force the browser to download the entire app (including every syntax
 * highlighting language grammar) on every single page load.
 */
function readEntryScripts(angularBuildDir: string): { jsFiles: string[]; preloadFiles: string[] } {
    const indexPath = path.join(angularBuildDir, "index.csr.html");

    if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, "utf-8");
        const jsFiles = [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*type="module"[^>]*>/gi)].map(m => m[1]);
        const preloadFiles = [...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/gi)].map(m => m[1]);

        if (jsFiles.length) return { jsFiles, preloadFiles };
    }

    // Fallback if index.csr.html isn't available: at least ship main.js eagerly
    // rather than falling back to preloading every chunk in the build.
    const mainFile = fs.readdirSync(angularBuildDir).find(name => /^main(-[A-Z0-9]+)?\.js$/i.test(name));
    return { jsFiles: mainFile ? [mainFile] : [], preloadFiles: [] };
}

export function copyBundledTheme(outRoot: string): AssetManifest | null {
    const themeCss = path.resolve(__dirname, "assets", "theme.css");
    if (!fs.existsSync(themeCss)) return null;

    const assetsDir = path.join(outRoot, "assets");
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.copyFileSync(themeCss, path.join(assetsDir, "theme.css"));

    return makeAssetManifest({ cssFile: "assets/theme.css" });
}

export function copyDocsAssets(docsRoot: string, outRoot: string): void {
    const src = path.join(docsRoot, "assets");
    if (!fs.existsSync(src)) return;

    const dest = path.join(outRoot, "assets");
    copyDir(src, dest);
}

export function copyMermaidAsset(outRoot: string): void {
    let src: string;
    try {
        src = require.resolve("mermaid/dist/mermaid.esm.min.mjs");
    } catch {
        return;
    }

    const assetsDir = path.join(outRoot, "assets");
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.copyFileSync(src, path.join(assetsDir, "mermaid.esm.min.mjs"));

    const chunksDir = path.join(path.dirname(src), "chunks", "mermaid.esm.min");
    if (fs.existsSync(chunksDir)) {
        copyDir(chunksDir, path.join(assetsDir, "chunks", "mermaid.esm.min"));
    }
}

function copyDir(src: string, dest: string): void {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
