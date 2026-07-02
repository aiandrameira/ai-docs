---
title: Suporte a versões
description: Política de suporte a versões do AI-Docs e do Node.js.
order: 5
---

# Suporte a versões

## Versões do AI-Docs

| Versão | Status       | Suporte até |
|--------|-------------|-------------|
| 0.x    | Em desenvolvimento | — |

O AI-Docs ainda está em desenvolvimento ativo. A API pública pode mudar entre versões `0.x`. A partir da `1.0.0`, o projeto adotará [Semantic Versioning](https://semver.org/lang/pt-BR/).

## Node.js

| Node.js | Suportado |
|---------|-----------|
| 22.x (LTS) | ✅ |
| 20.x (LTS) | ✅ |
| 18.x | ⚠️ Não testado |
| < 18 | ❌ |

Recomendamos sempre usar a versão LTS mais recente do Node.js.

## Angular

O AI-Docs usa Angular internamente para a renderização SSR. Você **não precisa** ter Angular no seu projeto — ele é uma dependência interna do gerador.

| Angular | Versão do AI-Docs |
|---------|-------------------|
| 21.x | 0.x |

## Compatibilidade de build

O output gerado é HTML estático puro. Funciona em qualquer ambiente que sirva arquivos estáticos:

- GitHub Pages
- Vercel
- Netlify
- AWS S3 + CloudFront
- Qualquer servidor Nginx/Apache

## Política de breaking changes

Durante a fase `0.x`:

- Mudanças no schema do `ai-docs.config.ts` serão documentadas no changelog
- Estrutura de pastas e frontmatter permanecem estáveis
- APIs internas (componentes Angular, parsers) podem mudar sem aviso

A partir da `1.0.0`, qualquer breaking change virá acompanhada de um major bump e um guia de migração.
