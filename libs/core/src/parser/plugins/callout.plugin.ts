import type MarkdownIt from "markdown-it";

const ICONS: Record<string, string> = {
    primary: "ri-stack-line",
    info: "ri-information-line",
    success: "ri-checkbox-circle-line",
    warning: "ri-alert-line",
    destructive: "ri-error-warning-line",
};

const TYPES = Object.keys(ICONS).join("|");
const OPEN_RE = new RegExp(`^:::\\s*(${TYPES})\\s*(.*)$`);

export function applyCalloutPlugin(md: MarkdownIt): void {
    md.block.ruler.before(
        "fence",
        "callout",
        (state, startLine, endLine, silent) => {
            const startPos = state.bMarks[startLine] + state.tShift[startLine];
            const max = state.eMarks[startLine];
            const line = state.src.slice(startPos, max).trim();

            const openMatch = OPEN_RE.exec(line);
            if (!openMatch) return false;

            let nextLine = startLine + 1;
            let found = false;
            for (; nextLine < endLine; nextLine++) {
                const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
                const lineMax = state.eMarks[nextLine];
                if (state.src.slice(lineStart, lineMax).trim() === ":::") {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
            if (silent) return true;

            const type = openMatch[1];
            const title = openMatch[2].trim();

            const openToken = state.push("callout_open", "div", 1);
            openToken.meta = { type, title };
            openToken.block = true;
            openToken.map = [startLine, nextLine];

            state.md.block.tokenize(state, startLine + 1, nextLine);

            const closeToken = state.push("callout_close", "div", -1);
            closeToken.block = true;

            state.line = nextLine + 1;
            return true;
        },
        { alt: ["paragraph", "reference", "blockquote", "list"] },
    );

    md.renderer.rules["callout_open"] = (tokens, idx) => {
        const { type, title } = tokens[idx].meta as { type: string; title: string };
        const icon = ICONS[type] ?? "ri-information-line";
        const titleHtml = title ? `<strong>${md.utils.escapeHtml(title)}</strong>\n` : "";
        return `<div class="callout callout-${type}"><i class="${icon} callout-icon"></i><div class="callout-body">${titleHtml}`;
    };
    md.renderer.rules["callout_close"] = () => `</div></div>\n`;
}
