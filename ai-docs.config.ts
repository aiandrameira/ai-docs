import { defineConfig } from './libs/core/src/types';

export default defineConfig({
    title: 'AI-Docs',
    description: 'Gerador de documentação estática para projetos TypeScript com Angular SSR.',
    docs: './docs',
    output: './dist/docs-preview',
    base: '/',

    features: {
        search: true,
        darkMode: true,
        copyCode: true,
        mermaid: true,
    },

    footer: {
        copyright: '© 2026 Aiandra Alves',
    },
});
