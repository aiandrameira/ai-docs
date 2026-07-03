import * as fs from "fs";
import * as path from "path";

import { bootstrapApplication, BootstrapContext } from "@angular/platform-browser";
import { renderApplication } from "@angular/platform-server";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

import { App } from "../app/app";
import { serverConfig } from "../app/app.config.server";

import type { PageContext } from "@libs/core";
export interface AssetManifest {
    cssFile: string | null;
    jsFiles: string[];
    preloadFiles: string[];
}

const DARK_MODE_SCRIPT = `<script>
(function(){
    document.documentElement.classList.add('no-flash');
    var t=localStorage.getItem('theme');
    var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark');}
})();
</script>
<style>html.no-flash body{visibility:hidden;}</style>`;

export interface PrerenderOptions {
    indexHtml?: string;
    base?: string;
    cssPath?: string;
    assets?: AssetManifest | null;
}

function buildBaseTemplate(): string {
    const serverIndexPath = path.join(process.cwd(), "dist", "apps", "web", "server", "index.server.html");

    if (fs.existsSync(serverIndexPath)) {
        let html = fs.readFileSync(serverIndexPath, "utf-8");

        html = html.replace(/<title>[^<]*<\/title>/i, "");
        html = html.replace(/<link rel="stylesheet" href="styles[^"]*\.css"[^>]*>/i, "");
        html = html.replace(/<base href="[^"]*"[^>]*>/i, "");
        html = html.replace("</head>", `${DARK_MODE_SCRIPT}</head>`);

        return html;
    }

    return `<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Montserrat:wght@100..900&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css" rel="stylesheet" />
        ${DARK_MODE_SCRIPT}
    </head>
    <body>
        <app-root></app-root>
    </body>
</html>`;
}

export async function prerenderPage(context: PageContext, opts: PrerenderOptions = {}): Promise<string> {
    const title = context.page.frontMatter.title ?? context.page.slug;
    const siteName = context.config.title;
    const base = opts.base ?? context.config.base ?? "/";
    const cssPath = opts.cssPath ?? opts.assets?.cssFile ?? `${base}assets/styles.css`;

    const description = String(context.page.frontMatter.description ?? context.config.description ?? "");
    const pageUrl = `${base}${context.page.slug}`;

    const baseTemplate = buildBaseTemplate();
    const headExtras = buildHeadExtras({ title, siteName, description, base, cssPath, pageUrl, config: context.config });
    const indexHtml = baseTemplate.replace("</head>", `${headExtras}\n</head>`);

    const url = context.page.slug ? `/${context.page.slug}` : "/";

    const html = await renderApplication(
        (bootstrapCtx: BootstrapContext) =>
            bootstrapApplication(
                App,
                {
                    ...serverConfig,
                    providers: [...serverConfig.providers, { provide: DOC_PAGE_CONTEXT, useValue: context }, { provide: DOC_SITE_CONFIG, useValue: context.config }],
                },
                bootstrapCtx,
            ),
        { document: indexHtml, url },
    );

    const clientCtx = { ...context, page: { ...context.page, content: undefined } };
    const safeJson = JSON.stringify(clientCtx).replace(/<\/script>/gi, "<\\/script>");
    const ctxScript = `<script type="application/json" id="__DOC_CTX__">${safeJson}</script>`;

    const jsBundles = buildJsBundles(opts.assets);
    return html.replace("</body>", `${ctxScript}\n${jsBundles}\n</body>`);
}

function buildJsBundles(assets: AssetManifest | null | undefined): string {
    if (!assets) return "";
    const lines: string[] = [];
    for (const chunk of assets.preloadFiles) {
        lines.push(`<link rel="modulepreload" href="${chunk}">`);
    }
    for (const js of assets.jsFiles) {
        lines.push(`<script src="${js}" type="module"></script>`);
    }
    return lines.join("\n");
}

function buildHeadExtras(opts: { title: string; siteName: string; description: string; base: string; cssPath: string; pageUrl: string; config: PageContext["config"] }): string {
    const { title, siteName, description, base, cssPath, pageUrl, config } = opts;
    const fullTitle = `${escapeHtml(title)} — ${escapeHtml(siteName)}`;

    const lines: string[] = [`  <title>${fullTitle}</title>`, `  <base href="${base}" />`, `  <link rel="stylesheet" href="${cssPath}" />`];

    if (config.theme?.customCss) {
        lines.push(`  <link rel="stylesheet" href="${escapeHtml(config.theme.customCss)}" />`);
    }
    if (description) {
        lines.push(`  <meta name="description" content="${escapeHtml(description)}" />`);
    }

    lines.push(`  <meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
    lines.push(`  <meta property="og:type" content="article" />`);
    if (description) {
        lines.push(`  <meta property="og:description" content="${escapeHtml(description)}" />`);
    }
    if (pageUrl) {
        lines.push(`  <meta property="og:url" content="${escapeHtml(pageUrl)}" />`);
    }
    if (config.logo) {
        lines.push(`  <meta property="og:image" content="${escapeHtml(config.logo)}" />`);
    }
    if (config.favicon) {
        lines.push(`  <link rel="icon" href="${escapeHtml(config.favicon)}" />`);
    }

    return lines.join("\n");
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
