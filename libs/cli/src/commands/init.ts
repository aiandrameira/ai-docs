import * as fs from "fs";
import * as path from "path";

import { logger } from "../config/logger";

const CONFIG_TEMPLATE = `import { defineConfig } from '@aiandrameira/cli/config';

export default defineConfig({
    title: "My Project",
    description: "Project documentation",
    docs: "./docs",
    output: "./dist/docs",
    base: "/",
    features: {
        search: true,
        darkMode: true,
        copyCode: true,
        mermaid: false,
    },
    footer: {
        copyright: "© 2026 My Company",
    },
});
`;

const INDEX_MD = `---
title: Introdução
order: 1
---

# Bem-vindo

Esta é a documentação do **My Project**, gerada com [AI-Docs](https://github.com/aiandrameira/ai-docs).

## Instalação

\`\`\`bash
npm install my-project
\`\`\`

## Início Rápido

Lorem ipsum dolor sit amet, consectetur adipiscing elit.
`;

const GETTING_STARTED_MD = `---
title: Primeiros Passos
order: 2
---

# Primeiros Passos

Configure o projeto em minutos.

## Pré-requisitos

- Node.js 24+
- TypeScript 5+

## Configuração

Edite o arquivo \`ai-docs.config.ts\` na raiz do projeto.
`;

export async function runInit(targetDir: string): Promise<void> {
    const docsDir = path.join(targetDir, "docs");
    const guideDir = path.join(docsDir, "guide");
    const configPath = path.join(targetDir, "ai-docs.config.ts");

    logger.log("\n  Initializing AI-Docs...\n");

    if (fs.existsSync(configPath)) {
        logger.warn("ai-docs.config.ts already exists — skipping.");
    } else {
        fs.writeFileSync(configPath, CONFIG_TEMPLATE, "utf-8");
        logger.success("ai-docs.config.ts");
    }

    fs.mkdirSync(docsDir, { recursive: true });
    fs.mkdirSync(guideDir, { recursive: true });

    writeIfNotExists(path.join(docsDir, "index.md"), INDEX_MD);
    writeIfNotExists(path.join(guideDir, "getting-started.md"), GETTING_STARTED_MD);

    logger.log("\n  Done! Run `ai-docs build` to generate the site.\n");
}

function writeIfNotExists(filePath: string, content: string): void {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content, "utf-8");
        logger.success(path.relative(process.cwd(), filePath));
    } else {
        logger.warn(`Skipped (already exists): ${filePath}`);
    }
}
