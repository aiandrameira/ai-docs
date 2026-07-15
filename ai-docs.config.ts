import { defineConfig } from "./libs/core/src/types";

export default defineConfig({
    title: "Ai Docs",
    description: "Gerador de documentação estática para projetos TypeScript com Angular SSR.",
    docs: "./docs",
    output: "./dist/docs-preview",
    base: "/",
    logo: "/assets/img/logo.svg",
    github: "https://github.com/aiandrameira/ai-docs",
    features: {
        search: true,
        darkMode: true,
        copyCode: true,
        mermaid: true,
    },
    home: true,
});
