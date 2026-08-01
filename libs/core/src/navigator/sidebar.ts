import type { DocPage, SidebarItem } from "../types";

export function buildSidebar(pages: DocPage[], currentSlug?: string): SidebarItem[] {
    const root = makeSidebarNode("", "");

    for (const page of pages) {
        if (page.frontMatter.sidebar === false) continue;

        if (!page.slug) {
            root.page = page;
            continue;
        }

        let node = root;
        for (const segment of page.slug.split("/")) {
            const nodePath = node.path ? `${node.path}/${segment}` : segment;
            let child = node.children.get(segment);

            if (!child) {
                child = makeSidebarNode(segment, nodePath);
                node.children.set(segment, child);
            }

            node = child;
        }

        node.page = page;
    }

    const items = [...root.children.values()].map(node => nodeToItem(node, currentSlug));
    if (root.page) items.push(pageToItem(root.page, currentSlug));

    return sortItems(items);
}

interface SidebarNode {
    segment: string;
    path: string;
    page?: DocPage;
    children: Map<string, SidebarNode>;
}

function makeSidebarNode(segment: string, nodePath: string): SidebarNode {
    return { segment, path: nodePath, children: new Map() };
}

function nodeToItem(node: SidebarNode, currentSlug?: string): SidebarItem {
    if (node.children.size === 0 && node.page) {
        return pageToItem(node.page, currentSlug);
    }

    const children = sortItems([...node.children.values()].map(child => nodeToItem(child, currentSlug)));
    const descendantOrder = children.length > 0 ? Math.min(...children.map(child => child.order)) : 999;

    return {
        title: node.page?.frontMatter.title ?? dirToTitle(node.segment),
        href: `/${node.path}`,
        order: node.page?.frontMatter.order ?? descendantOrder,
        active: currentSlug === node.path || currentSlug?.startsWith(`${node.path}/`),
        children,
    };
}

function pageToItem(page: DocPage, currentSlug?: string): SidebarItem {
    return {
        title: page.frontMatter.title ?? page.slug,
        href: `/${page.slug}`,
        order: page.frontMatter.order ?? 999,
        active: page.slug === currentSlug,
    };
}

function sortItems(items: SidebarItem[]): SidebarItem[] {
    return items.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.title.localeCompare(b.title)));
}

function dirToTitle(segment: string): string {
    return segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
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
