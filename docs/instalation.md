---
title: Instalação
description: Como instalar e inicializar o AI-Docs em um projeto TypeScript.
order: 2
---

# Instalação

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Um projeto TypeScript (Angular, Nx, ou qualquer estrutura)

## Via npx (recomendado)

A forma mais rápida de começar é usando `npx` sem precisar instalar nada globalmente:

```bash
npx @aiandrameira/ai-docs init
```

O comando `init` cria o arquivo de configuração `ai-docs.config.ts` e a pasta `docs/` com uma página inicial.

## Instalação local

Para usar o CLI diretamente nos scripts do projeto:

```bash
npm install --save-dev @aiandrameira/ai-docs
```

Adicione os scripts ao `package.json`:

```json
{
  "scripts": {
    "docs:dev": "ai-docs dev",
    "docs:build": "ai-docs build"
  }
}
```

## Estrutura inicial

Após o `init`, seu projeto terá:

```
meu-projeto/
├── ai-docs.config.ts   ← configuração principal
├── docs/
│   └── index.md        ← página de entrada
└── package.json
```

## Verificando a instalação

Inicie o servidor de desenvolvimento:

```bash
npm run docs:dev
```

Acesse [http://localhost:4555](http://localhost:4555). Se a página inicial carregar, a instalação está correta.

> **Porta padrão:** 4555. Para mudar, use `ai-docs dev --port 3000`.
