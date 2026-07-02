import type { DocPage } from "../types";

export interface SearchEntry {
    slug: string;
    title: string;
    description: string;
    content: string;
    section: string;
}

const TAG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/g;

export function buildSearchIndex(pages: DocPage[]): SearchEntry[] {
    return pages
        .filter(p => !p.frontMatter.draft)
        .map(page => {
            const plainText = page.content.replace(TAG_RE, " ").replace(WHITESPACE_RE, " ").trim().slice(0, 5000);
            const section = page.slug.split("/")[0] ?? "";

            return {
                slug: page.slug,
                title: page.frontMatter.title ?? page.slug,
                description: String(page.frontMatter.description ?? ""),
                content: plainText,
                section,
            };
        });
}
