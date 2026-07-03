import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const bundlePath = new URL('file:///' + resolve(root, 'dist/apps/web/server/server.mjs').replace(/\\/g, '/'));
const { prerenderPage } = await import(bundlePath);

const testCtx = {
    page: {
        slug: 'test',
        filePath: 'docs/test.md',
        frontMatter: { title: 'Teste' },
        content: '<h1>Teste</h1><p>Conteúdo.</p>',
        rawContent: '# Teste\n\nConteúdo.',
    },
    sidebar: [],
    toc: [],
    breadcrumb: [{ title: 'Teste', href: '/test' }],
    config: {
        title: 'AI-Docs',
        docs: './docs',
        output: './dist',
        base: '/',
        features: { search: true, darkMode: true, copyCode: true },
    },
};

try {
    const html = await prerenderPage(testCtx, {});
    console.log('✓ Angular SSR works! HTML length:', html.length);
    console.log('Preview:', html.slice(0, 200));
} catch (e) {
    console.error('✗ Failed:', e.message?.slice(0, 300));
}
