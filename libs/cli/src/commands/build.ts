import * as fs from "fs";
import * as path from "path";

import { buildBreadcrumb, buildSearchIndex, buildSidebar, extractToc, parseFileAsync, resolvePrevNext } from "@aiandrameira/core";
import { copyAngularAssets, copyDocsAssets, copyMermaidAsset } from "../assets/copier";
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

    const assets = await copyAngularAssets(outRoot);
    if (!assets) {
        warnings.push("Angular build not found — run `nx build web` first for full styling. Falling back to static render without CSS.");
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
    const serverBundle = path.join(process.cwd(), "dist", "apps", "web", "server", "server.mjs");
    if (fs.existsSync(serverBundle)) {
        try {
            const mod = (await import(serverBundle)) as { prerenderPage: Renderer };
            if (mod.prerenderPage) {
                return (ctx, assets) => mod.prerenderPage(ctx, { assets } as never);
            }
        } catch (e) {
            warnings.push(`Angular SSR bundle failed: ${(e as Error).message?.slice(0, 120)}`);
        }
    }

    try {
        const prerenderSource = path.join(process.cwd(), "apps", "web", "src", "engine", "prerender");
        const mod = (await import(prerenderSource)) as { prerenderPage: Renderer };
        return (ctx, assets) => mod.prerenderPage(ctx, { assets } as never);
    } catch {
        // fall through to static
    }

    warnings.push("Angular renderer not available — using static template fallback. Run `npx nx build web` to enable full Angular SSR rendering.");
    return ctx => Promise.resolve(staticRender(ctx));
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

function staticRender(ctx: PageContext): string {
    const { page, sidebar, toc, breadcrumb, prev, next, config } = ctx;
    const title = `${page.frontMatter.title ?? page.slug} — ${config.title}`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
        ${page.frontMatter.description ? `<meta name="description" content="${escapeHtml(String(page.frontMatter.description))}" />` : ""}
        <script>(function(){var t=localStorage.getItem('ai-docs-theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark');}})()</script>
    </head>
    <body>
        <div class="doc-layout">
            <header class="doc-header"><a href="${config.base ?? "/"}" class="logo">${escapeHtml(config.title)}</a></header>
            <aside class="doc-sidebar">${renderSidebar(sidebar, page.slug)}</aside>
            <main class="doc-content">
                ${renderBreadcrumb(breadcrumb)}
                <article>${page.content}</article>
                ${renderPrevNext(prev, next)}
            </main>
            <nav class="doc-toc">${renderToc(toc)}</nav>
        </div>
    </body>
</html>`;
}

function renderSidebar(items: ReturnType<typeof buildSidebar>, slug: string): string {
    function renderItems(list: typeof items): string {
        return list
            .map(item => {
                const active = item.active || item.href === `/${slug}`;
                const children = item.children?.length ? `<ul>${renderItems(item.children)}</ul>` : "";
                return `<li><a href="${item.href}" class="${active ? "active" : ""}">${escapeHtml(item.title)}</a>${children}</li>`;
            })
            .join("");
    }
    return `<ul>${renderItems(items)}</ul>`;
}

function renderToc(items: ReturnType<typeof extractToc>): string {
    if (!items.length) return "";
    function renderItems(list: typeof items): string {
        return list.map(item => `<li><a href="#${item.id}">${escapeHtml(item.text)}</a>${item.children.length ? `<ul>${renderItems(item.children)}</ul>` : ""}</li>`).join("");
    }
    return `<p>Nesta página</p><ul>${renderItems(items)}</ul>`;
}

function renderBreadcrumb(items: ReturnType<typeof buildBreadcrumb>): string {
    return items
        .map((item, i) => {
            const isLast = i === items.length - 1;
            return isLast ? `<span>${escapeHtml(item.title)}</span>` : `<a href="${item.href}">${escapeHtml(item.title)}</a><span>›</span>`;
        })
        .join("");
}

function renderPrevNext(prev: PageContext["prev"], next: PageContext["next"]): string {
    if (!prev && !next) return "";
    const prevHtml = prev ? `<a href="${prev.href}">← ${escapeHtml(prev.title)}</a>` : "<span></span>";
    const nextHtml = next ? `<a href="${next.href}">${escapeHtml(next.title)} →</a>` : "<span></span>";
    return `<nav>${prevHtml}${nextHtml}</nav>`;
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
