---
title: Introdução
description: AI-Docs é um gerador de documentação estática para projetos TypeScript, construído com Angular SSR e Markdown.
order: 1
---

# AI-Docs

**AI-Docs** é um gerador de documentação estática para projetos TypeScript. Escreva arquivos Markdown, obtenha um site completo com busca, dark mode, syntax highlighting e diagramas — sem configuração extra.

## O que você ganha

- **Syntax highlight server-side** com Shiki — zero JavaScript extra no cliente
- **Busca fuzzy** com Fuse.js via paleta de comandos (⌘K / Ctrl+K)
- **Diagramas Mermaid** renderizados sob demanda no cliente
- **Dark mode** sem flash — script inline detecta o tema antes da renderização
- **Angular SSR** — HTML pré-renderizado, hydration no cliente

## Como funciona

O AI-Docs lê arquivos `.md` de uma pasta configurável, converte para HTML usando markdown-it + Shiki e gera páginas estáticas via Angular Server-Side Rendering. O resultado é uma pasta `dist/` com HTML puro, pronta para qualquer CDN.

```
docs/
├── index.md          ← esta página
├── instalacao.md
└── guia/
    └── inicio.md
```

Cada arquivo vira uma rota. A sidebar e a navegação são geradas automaticamente a partir da estrutura de pastas e do frontmatter.

## Próximos passos

- [Instalação](/instalacao) — como adicionar ao seu projeto
- [Configuração](/configuracao) — todas as opções disponíveis
- [Guia passo a passo](/guia) — do zero ao site publicado
