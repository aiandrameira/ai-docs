---
title: Configuração
description: Referência completa do arquivo ai-docs.config.ts e de todas as opções disponíveis.
order: 4
---

# Configuração

Toda a configuração do AiDocs fica em `ai-docs.config.ts` na raiz do projeto.

## Estrutura básica

```ts
import { defineConfig } from "@aiandrameira/ai-docs/config";

export default defineConfig({
    title: "Minha Documentação",
    description: "Descrição do projeto.",
    docs: "./docs",
    output: "./dist/docs",
    base: "/",
});
```

## Opções

### `title` — obrigatório

Nome do site, exibido no header e nas meta tags.

```ts
title: "AiDocs";
```

### `description`

Descrição padrão para SEO e Open Graph.

```ts
description: "Gerador de documentação estática.";
```

### `docs`

Caminho para a pasta com os arquivos Markdown. Padrão: `./docs`.

```ts
docs: "./docs";
```

### `output`

Pasta de saída do build. Padrão: `./dist/docs`.

```ts
output: "./dist/docs";
```

### `base`

URL base do site. Útil para deploys em subpaths (ex: GitHub Pages em `/meu-repo/`).

```ts
base: "/meu-repo/";
```

### `logo`

Caminho para a imagem de logo exibida no header. Se omitido, exibe um ícone genérico com o `title`.

```ts
logo: "/assets/logo.svg";
```

### `favicon`

Caminho para o favicon do site.

```ts
favicon: "/assets/favicon.ico";
```

### `github`

URL do repositório no GitHub. Se definido, exibe um ícone de GitHub no header, ao lado do alternador de tema.

```ts
github: "https://github.com/usuario/repo";
```

### `nav`

Links exibidos no header, ao lado do botão de busca.

```ts
nav: [
    { label: "GitHub", href: "https://github.com/usuario/repo" },
    { label: "npm", href: "https://npmjs.com/package/meu-pacote" },
];
```

### `features`

Habilita ou desabilita funcionalidades:

```ts
features: {
  search: true,       // paleta de busca ⌘K
  darkMode: true,     // alternador de tema claro/escuro
  copyCode: true,     // botão de copiar em blocos de código
  mermaid: true,      // renderização de diagramas Mermaid
  editOnGitHub: {     // link "Editar no GitHub" no rodapé de cada página
    repo: 'https://github.com/usuario/repo',
    branch: 'main',
    docsDir: 'docs',
  },
}
```

### `theme`

Personalizações visuais:

```ts
theme: {
  customCss: '/assets/custom.css',  // CSS extra injetado após o tema padrão
}
```

## Frontmatter

Cada arquivo Markdown aceita frontmatter YAML para controlar sua exibição:

```yaml
---
title: Título da página
description: Descrição para SEO
order: 1 # posição na sidebar (menor = primeiro)
draft: true # oculta a página do build
sidebar: false # oculta da sidebar mas ainda acessível pela URL
toc: false # desativa o sumário lateral
breadcrumb: false # desativa o breadcrumb
---
```
