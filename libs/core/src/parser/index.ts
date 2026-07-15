import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import * as path from "path";

import { applyCalloutPlugin } from "./plugins/callout.plugin";
import { applyDirectivePlugin } from "./plugins/directive.plugin";
import { applyMermaidPlugin } from "./plugins/mermaid.plugin";
import { applyShikiPlugin } from "./plugins/shiki.plugin";

import type { DocPage, FrontMatter, SiteConfig } from "../types";

export interface ParserOptions {
    shiki?: boolean;
    mermaid?: boolean;
    codeTheme?: SiteConfig["theme"] extends infer T ? (T extends { codeTheme?: infer C } ? C : undefined) : undefined;
}

export function createParser(): MarkdownIt {
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

    applyAnchorPlugin(md);
    applyCalloutPlugin(md);
    applyDirectivePlugin(md);
    applyCopyCodePlugin(md);

    return md;
}

export async function createAsyncParser(opts: ParserOptions = {}): Promise<MarkdownIt> {
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

    applyAnchorPlugin(md);
    applyCalloutPlugin(md);
    applyDirectivePlugin(md);

    if (opts.shiki !== false) {
        await applyShikiPlugin(md, {
            light: (opts.codeTheme?.light ?? "github-light") as never,
            dark: (opts.codeTheme?.dark ?? "github-dark") as never,
        });
    } else {
        applyCopyCodePlugin(md);
    }

    if (opts.mermaid) {
        applyMermaidPlugin(md);
    }

    return md;
}

export function parseFile(filePath: string, rawContent: string, docsRoot: string): DocPage {
    const { data, content } = matter(rawContent);
    const frontMatter = data as FrontMatter;

    const md = createParser();
    const html = md.render(content);

    return makeDocPage(filePath, rawContent, frontMatter, html, docsRoot);
}

export async function parseFileAsync(filePath: string, rawContent: string, docsRoot: string, opts: ParserOptions = {}): Promise<DocPage> {
    const { data, content } = matter(rawContent);
    const frontMatter = data as FrontMatter;

    const md = await createAsyncParser(opts);
    const html = md.render(content);

    return makeDocPage(filePath, rawContent, frontMatter, html, docsRoot);
}

function makeDocPage(filePath: string, rawContent: string, frontMatter: FrontMatter, html: string, docsRoot: string): DocPage {
    const slug = filePathToSlug(filePath, docsRoot);
    const title = frontMatter.title ?? slugToTitle(slug);

    return {
        slug,
        filePath,
        frontMatter: { ...frontMatter, title },
        content: html,
        rawContent,
    };
}

export function filePathToSlug(filePath: string, docsRoot: string): string {
    const relative = path.relative(docsRoot, filePath);
    return relative
        .replace(/\\/g, "/")
        .replace(/\.md$/, "")
        .replace(/\/index$/, "")
        .replace(/^index$/, "");
}

export function slugToTitle(slug: string): string {
    const segment = slug.split("/").pop() ?? slug;
    return segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function applyAnchorPlugin(md: MarkdownIt): void {
    const defaultRender = md.renderer.rules["heading_open"] ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules["heading_open"] = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const inline = tokens[idx + 1];
        const text = inline?.children?.map(t => t.content).join("") ?? "";
        const id = text
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

        token.attrSet("id", id);

        return defaultRender(tokens, idx, options, env, self);
    };
}

function applyCopyCodePlugin(md: MarkdownIt): void {
    const defaultFence = md.renderer.rules["fence"] ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

    md.renderer.rules["fence"] = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const lang = token.info.trim().split(/\s+/)[0] || "text";
        const code = token.content;
        const original = defaultFence(tokens, idx, options, env, self);

        return `<div class="code-block" data-lang="${lang}">
    <button class="copy-code-btn" aria-label="Copiar código" data-code="${encodeURIComponent(code)}">
        <i class="ri-file-copy-line"></i> Copiar
    </button>
    ${original}
</div>\n`;
    };
}
