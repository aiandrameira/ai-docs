import type { TocItem } from "../types";

const HEADING_RE = /<h([234])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi;
const TAG_RE = /<[^>]+>/g;

export function extractToc(html: string): TocItem[] {
    const flat: TocItem[] = [];
    let match: RegExpExecArray | null;

    HEADING_RE.lastIndex = 0;

    while ((match = HEADING_RE.exec(html)) !== null) {
        const level = parseInt(match[1], 10) as 2 | 3 | 4;
        const id = match[2];
        const rawText = match[3].replace(TAG_RE, "").trim();

        flat.push({ id, text: rawText, level, children: [] });
    }

    return nestToc(flat);
}

function nestToc(flat: TocItem[]): TocItem[] {
    const root: TocItem[] = [];
    const stack: TocItem[] = [];

    for (const item of flat) {
        while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            root.push(item);
        } else {
            stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
    }

    return root;
}
