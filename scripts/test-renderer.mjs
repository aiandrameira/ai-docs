import { createJiti } from 'jiti';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), '..');

const jiti = createJiti(__filename, {
    alias: {
        '@aiandrameira/core': resolve(root, 'libs/core/src/index.ts'),
    },
    fsCache: false,
    moduleCache: false,
});

try {
    const mod = await jiti.import(resolve(root, 'apps/web/src/engine/prerender.ts'));
    console.log('Angular renderer loaded OK:', Object.keys(mod));
} catch (e) {
    console.error('FAIL:', e.message?.slice(0, 400));
}
