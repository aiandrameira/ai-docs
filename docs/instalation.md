---
title: Instalação
description: Como instalar e inicializar o AiDocs em um projeto TypeScript.
order: 3
---

# Instalação

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Um projeto TypeScript (Angular, Nx, ou qualquer estrutura)

## Instalação local (recomendado)

```bash
npm install --save-dev @aiandralves/ai-docs
```

Isso instala um único pacote autocontido — o `core` (parser, sidebar, busca) já vem embutido no bundle, junto com todas as dependências de terceiros. Nada mais precisa ser instalado.

Adicione os scripts ao `package.json`:

```json
{
    "scripts": {
        "docs:dev": "ai-docs dev",
        "docs:build": "ai-docs build"
    }
}
```

Para usar uma porta diferente da padrão (4000), passe `--port` (ou `-p`):

```json
{
    "scripts": {
        "docs:dev": "ai-docs dev --port 4001"
    }
}
```

## Via npx

Também é possível inicializar a documentação sem instalar o pacote antes:

```bash
npx @aiandralves/ai-docs init
npx ai-docs init
```

O comando `init` cria o arquivo de configuração `ai-docs.config.ts` e a pasta `docs/` com uma página inicial.

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

## Sobre o tema visual

O tema (layout, dark mode, tipografia, busca ⌘K, syntax highlight) é renderizado pelo mesmo motor Angular SSR usado neste monorepo — o pacote `@aiandralves/ai-docs` já vem com esse motor embutido, pronto para uso. `ai-docs build` gera páginas HTML estáticas (nenhum servidor Angular precisa rodar em produção; o Angular só é usado durante o build, para gerar o HTML). Nenhuma instalação ou configuração extra é necessária.

Componentes, ícones e estilos são definidos uma única vez no projeto Angular (`apps/web`) — qualquer alteração no tema publicada em uma nova versão do `@aiandralves/ai-docs` já reflete automaticamente em todos os projetos que o usam.
