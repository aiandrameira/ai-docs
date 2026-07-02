import * as path from "path";

import type { DocPage, SidebarItem } from "../types";

export function buildSidebar(pages: DocPage[], currentSlug?: string): SidebarItem[] {
    const grouped = groupByDirectory(pages);
    return buildTree(grouped, currentSlug);
}

interface GroupedPages {
    [dir: string]: DocPage[];
}

function groupByDirectory(pages: DocPage[]): GroupedPages {
    const groups: GroupedPages = { "": [] };

    for (const page of pages) {
        if (page.frontMatter.sidebar === false) continue;

        const dir = path.dirname(page.slug);
        const normalizedDir = dir === "." ? "" : dir;

        if (!groups[normalizedDir]) groups[normalizedDir] = [];
        groups[normalizedDir].push(page);
    }

    return groups;
}

function buildTree(groups: GroupedPages, currentSlug?: string): SidebarItem[] {
    const roots: SidebarItem[] = [];

    for (const [dir, pages] of Object.entries(groups)) {
        if (dir === "") {
            const sorted = sortPages(pages);
            roots.push(...sorted.map(page => pageToItem(page, currentSlug)));
        } else {
            const indexPage = pages.find(p => p.slug === dir);
            const children = sortPages(pages.filter(p => p.slug !== dir)).map(page => pageToItem(page, currentSlug));

            const groupOrder = indexPage?.frontMatter.order ?? Math.min(...pages.map(p => p.frontMatter.order ?? 999));

            const groupTitle = indexPage?.frontMatter.title ?? dirToTitle(dir);
            const groupHref = indexPage ? `/${dir}` : `/${dir}`;
            const isGroupActive = currentSlug?.startsWith(dir);

            roots.push({
                title: groupTitle,
                href: groupHref,
                order: groupOrder,
                active: isGroupActive,
                children: children.length > 0 ? children : undefined,
            });
        }
    }

    return roots.sort((a, b) => a.order - b.order);
}

function pageToItem(page: DocPage, currentSlug?: string): SidebarItem {
    return {
        title: page.frontMatter.title ?? page.slug,
        href: `/${page.slug}`,
        order: page.frontMatter.order ?? 999,
        active: page.slug === currentSlug,
    };
}

function sortPages(pages: DocPage[]): DocPage[] {
    return [...pages].sort((a, b) => {
        const orderA = a.frontMatter.order ?? 999;
        const orderB = b.frontMatter.order ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.frontMatter.title ?? a.slug).localeCompare(b.frontMatter.title ?? b.slug);
    });
}

function dirToTitle(dir: string): string {
    const last = dir.split("/").pop() ?? dir;
    return last.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function resolvePrevNext(pages: DocPage[], currentSlug: string): { prev?: DocPage; next?: DocPage } {
    const visible = pages.filter(p => p.frontMatter.sidebar !== false);
    const sorted = visible.sort((a, b) => {
        const orderA = a.frontMatter.order ?? 999;
        const orderB = b.frontMatter.order ?? 999;
        return orderA !== orderB ? orderA - orderB : (a.frontMatter.title ?? a.slug).localeCompare(b.frontMatter.title ?? b.slug);
    });

    const idx = sorted.findIndex(p => p.slug === currentSlug);
    return {
        prev: idx > 0 ? sorted[idx - 1] : undefined,
        next: idx < sorted.length - 1 ? sorted[idx + 1] : undefined,
    };
}
