import * as fs from "fs";
import * as path from "path";
import { pathToFileURL } from "url";

import { buildBreadcrumb, buildSearchIndex, buildSidebar, extractToc, parseFileAsync, resolvePrevNext } from "@aiandrameira/core";

import { copyAngularAssets, copyBundledTheme, copyDocsAssets, copyMermaidAsset } from "../assets/copier";
import { logger } from "../config/logger";
import { spinner } from "../config/spinner";

import type { DocPage, PageContext, SiteConfig } from "@aiandrameira/core";
import type { AssetManifest } from "../assets/copier";

export async function runBuild(config: SiteConfig, opts: { quiet?: boolean } = {}): Promise<void> {
    const start = Date.now();
    const docsRoot = path.resolve(config.docs ?? "./docs");
    const outRoot = path.resolve(config.output ?? "./dist");
    const quiet = opts.quiet ?? false;
    const warnings: string[] = [];

    if (!fs.existsSync(docsRoot)) {
        throw new Error(`Docs directory not found: ${docsRoot}`);
    }

    fs.mkdirSync(outRoot, { recursive: true });

    const setupSpinner = quiet ? null : spinner("Preparando build (assets, parser, Shiki)...");
    setupSpinner?.start();

    let assets = await copyAngularAssets(outRoot);
    if (!assets) {
        assets = copyBundledTheme(outRoot);
        if (!assets) {
            warnings.push("No theme CSS found — falling back to static render without styling.");
        }
    }
    copyDocsAssets(docsRoot, outRoot);
    if (config.features?.mermaid) {
        copyMermaidAsset(outRoot);
    }

    const mdFiles = discoverMarkdown(docsRoot);
    if (mdFiles.length === 0) {
        setupSpinner?.fail(`Nenhum arquivo .md encontrado em ${docsRoot}`);
        warnings.forEach(w => logger.warn(w));
        return;
    }

    const parserOpts = {
        shiki: config.features?.copyCode !== false,
        mermaid: config.features?.mermaid === true,
        codeTheme: config.theme?.codeTheme,
    };

    let pages: DocPage[] = (
        await Promise.all(
            mdFiles.map(filePath => {
                const raw = fs.readFileSync(filePath, "utf-8");
                return parseFileAsync(filePath, raw, docsRoot, parserOpts);
            }),
        )
    ).filter(page => !page.frontMatter["draft"]);

    const plugins = config.plugins ?? [];
    for (const plugin of plugins) {
        const transform = plugin.transform;
        if (transform) {
            pages = await Promise.all(pages.map(p => transform(p)));
        }
    }

    const sidebar = buildSidebar(pages);
    const renderer = await resolveRenderer(warnings);

    setupSpinner?.succeed(`Fonte: ${docsRoot} → ${outRoot}`);
    warnings.forEach(w => logger.warn(w));

    for (const page of pages) {
        const toc = extractToc(page.content);
        const breadcrumb = buildBreadcrumb(page.slug, page.frontMatter.title ?? page.slug);
        const { prev, next } = resolvePrevNext(pages, page.slug);

        const context: PageContext = {
            page,
            sidebar: buildSidebar(pages, page.slug),
            toc,
            breadcrumb,
            prev: prev
                ? {
                      title: prev.frontMatter.title ?? prev.slug,
                      href: `/${prev.slug}`,
                      order: prev.frontMatter.order ?? 999,
                  }
                : undefined,
            next: next
                ? {
                      title: next.frontMatter.title ?? next.slug,
                      href: `/${next.slug}`,
                      order: next.frontMatter.order ?? 999,
                  }
                : undefined,
            config,
        };

        const html = await renderer(context, assets);
        const outPath = resolveOutputPath(page.slug, outRoot);

        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html, "utf-8");
        if (!quiet) logger.success(page.slug || "index");
    }

    if (config.features?.search !== false) {
        const assetsDir = path.join(outRoot, "assets");
        fs.mkdirSync(assetsDir, { recursive: true });
        const searchIndex = buildSearchIndex(pages);
        fs.writeFileSync(path.join(assetsDir, "search-index.json"), JSON.stringify(searchIndex), "utf-8");
        if (!quiet) logger.success(`assets/search-index.json (${searchIndex.length} entries)`);
    }

    for (const plugin of plugins) {
        if (plugin.afterBuild) {
            await plugin.afterBuild(pages);
        }
    }

    const sidebarJson = JSON.stringify(sidebar, null, 2);
    const assetsDir = path.join(outRoot, "assets");
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(path.join(assetsDir, "sidebar.json"), sidebarJson, "utf-8");

    const elapsed = Date.now() - start;
    if (!quiet) logger.success(`Done — ${pages.length} page(s) in ${elapsed}ms`);
}

type Renderer = (ctx: PageContext, assets: AssetManifest | null) => Promise<string>;

async function resolveRenderer(warnings: string[]): Promise<Renderer> {
    const serverBundlePaths = [path.join(process.cwd(), "dist", "apps", "web", "server", "server.mjs"), path.resolve(__dirname, "web", "server", "server.mjs")];

    for (const serverBundle of serverBundlePaths) {
        if (!fs.existsSync(serverBundle)) continue;
        try {
            const mod = (await import(pathToFileURL(serverBundle).href)) as { prerenderPage: Renderer };
            if (mod.prerenderPage) {
                return (ctx, assets) => mod.prerenderPage(ctx, { assets } as never);
            }
        } catch (e) {
            warnings.push(`Angular SSR bundle failed: ${(e as Error).message?.slice(0, 120)}`);
        }
    }

    try {
        const prerenderSource = path.join(process.cwd(), "apps", "web", "src", "engine", "prerender");
        const mod = (await import(pathToFileURL(prerenderSource).href)) as { prerenderPage: Renderer };
        return (ctx, assets) => mod.prerenderPage(ctx, { assets } as never);
    } catch {
        // fall through to static
    }

    warnings.push("Angular renderer not available — using static template fallback (theme CSS applied when available).");
    return (ctx, assets) => Promise.resolve(staticRender(ctx, assets));
}

function discoverMarkdown(dir: string): string[] {
    const result: string[] = [];

    function walk(current: string) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (entry.isFile() && entry.name.endsWith(".md")) result.push(full);
        }
    }

    walk(dir);
    return result;
}

function resolveOutputPath(slug: string, outRoot: string): string {
    if (!slug) return path.join(outRoot, "index.html");
    return path.join(outRoot, slug, "index.html");
}

function staticRender(ctx: PageContext, assets: AssetManifest | null): string {
    const { page, sidebar, toc, breadcrumb, prev, next, config } = ctx;
    const title = `${page.frontMatter.title ?? page.slug} — ${config.title}`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
        ${page.frontMatter.description ? `<meta name="description" content="${escapeHtml(String(page.frontMatter.description))}" />` : ""}
        ${assets?.cssFile ? `<link rel="stylesheet" href="/${assets.cssFile}" />` : ""}
        <script>document.addEventListener('click',function(e){var btn=e.target.closest('.copy-code-btn');if(!btn)return;navigator.clipboard.writeText(decodeURIComponent(btn.dataset.code||''));})</script>
    </head>
    <body>
        <a href="${config.base ?? "/"}">${escapeHtml(config.title)}</a>
        <nav aria-label="Navegação">${renderLinkList(sidebar.map(item => ({ href: item.href, label: item.title })))}</nav>
        ${breadcrumb.length > 1 ? `<nav aria-label="Breadcrumb">${renderLinkList(breadcrumb.map(item => ({ href: item.href, label: item.title })))}</nav>` : ""}
        <article>${page.content}</article>
        <nav aria-label="Navegação entre páginas">${renderLinkList([prev, next].filter((item): item is NonNullable<typeof item> => Boolean(item)).map(item => ({ href: item.href, label: item.title })))}</nav>
        ${toc.length ? `<nav aria-label="Nesta página">${renderLinkList(flattenToc(toc).map(item => ({ href: `#${item.id}`, label: item.text })))}</nav>` : ""}
    </body>
</html>`;
}

function renderLinkList(items: Array<{ href?: string; label: string }>): string {
    return `<ul>${items.map(item => (item.href ? `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>` : `<li>${escapeHtml(item.label)}</li>`)).join("")}</ul>`;
}

function flattenToc(items: ReturnType<typeof extractToc>): ReturnType<typeof extractToc> {
    return items.flatMap(item => [item, ...flattenToc(item.children)]);
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
