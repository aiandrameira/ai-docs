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
                manifest.jsFiles.push(name);
            },
        },
        {
            match: (name: string) => name.startsWith("chunk-") && name.endsWith(".js"),
            run: (src: string, name: string) => {
                copyToRoot(src, name);
                manifest.preloadFiles.push(name);
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

    return manifest;
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
