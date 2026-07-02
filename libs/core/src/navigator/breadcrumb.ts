import type { BreadcrumbItem } from "../types";

export function buildBreadcrumb(slug: string, pageTitle: string): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [{ title: "Docs", href: "/" }];

    const segments = slug.split("/").filter(Boolean);

    if (segments.length === 0) return crumbs;

    for (let i = 0; i < segments.length - 1; i++) {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const title = segmentToTitle(segments[i]);
        crumbs.push({ title, href });
    }

    crumbs.push({ title: pageTitle });

    return crumbs;
}

function segmentToTitle(segment: string): string {
    return segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
