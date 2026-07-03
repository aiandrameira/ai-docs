/**
 * Dev runner for the ai-docs CLI.
 * Uses jiti to handle TypeScript + tsconfig path aliases at runtime.
 *
 * Usage:
 *   node scripts/run-cli.mjs build
 *   node scripts/run-cli.mjs dev
 *   node scripts/run-cli.mjs dev --port 4001
 */
import { createJiti } from 'jiti';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const jiti = createJiti(__filename, {
    fsCache: false,
    moduleCache: false,
    alias: {
        '@aiandrameira/core': resolve(root, 'libs/core/src/index.ts'),
        '@aiandrameira/cli': resolve(root, 'libs/cli/src/index.ts'),
        '@core/*': resolve(root, 'apps/web/src/app/core'),
        '@env/*': resolve(root, 'apps/web/src/environments'),
    },
});

await jiti.import(resolve(root, 'libs/cli/src/index.ts'));
