import { existsSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const browserDir = resolve(root, "dist/apps/web/browser");
const destDir = resolve(root, "libs/ai-docs/src/assets");
const destFile = resolve(destDir, "theme.css");

if (!existsSync(browserDir)) {
    console.error("dist/apps/web/browser not found. Run `npx nx run web:build` first.");
    process.exit(1);
}

const cssFile = readdirSync(browserDir).find(name => /^styles(-[A-Z0-9]+)?\.css$/i.test(name));

if (!cssFile) {
    console.error("No compiled styles*.css found in dist/apps/web/browser.");
    process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(resolve(browserDir, cssFile), destFile);

console.log(`Theme CSS extracted: ${cssFile} -> libs/ai-docs/src/assets/theme.css`);
