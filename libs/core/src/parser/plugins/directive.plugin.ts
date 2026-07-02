import type MarkdownIt from "markdown-it";

const DIRECTIVE_RE = /^::(http-method|badge)\[([^\]]*)\]/;

export function applyDirectivePlugin(md: MarkdownIt): void {
    md.inline.ruler.after("emphasis", "directive", (state, silent) => {
        const src = state.src.slice(state.pos);
        if (src.charCodeAt(0) !== 0x3a || src.charCodeAt(1) !== 0x3a) return false;

        const match = DIRECTIVE_RE.exec(src);
        if (!match) return false;

        if (!silent) {
            const token = state.push("directive", "", 0);
            token.meta = { name: match[1], content: match[2] };
        }

        state.pos += match[0].length;
        return true;
    });

    md.renderer.rules["directive"] = (tokens, idx) => {
        const { name, content } = tokens[idx].meta as { name: string; content: string };

        if (name === "http-method") {
            const method = content.trim().toUpperCase();
            return `<span class="http-method http-${method.toLowerCase()}">${md.utils.escapeHtml(method)}</span>`;
        }

        if (name === "badge") {
            return `<span class="badge"><i class="ri-check-line"></i> ${md.utils.escapeHtml(content.trim())}</span>`;
        }

        return "";
    };
}
