import type MarkdownIt from "markdown-it";

const EMOJI_MAP: Record<string, string> = {
    "⬅️": "ri-arrow-left-long-line",
    "➡️": "ri-arrow-right-long-line",
    "⬆️": "ri-arrow-up-long-line",
    "⬇️": "ri-arrow-down-long-line",
    "↗️": "ri-arrow-right-up-long-line",
    "↘️": "ri-arrow-right-down-long-line",
    "↙️": "ri-arrow-left-down-long-line",
    "↖️": "ri-arrow-left-up-long-line",
};

const TEXT_MAP: Record<string, string> = {
    "<->": "ri-arrow-left-right-line",
    "<=>": "ri-arrow-left-right-line",
    "-->": "ri-arrow-right-long-line",
    "->": "ri-arrow-right-long-line",
    "<-": "ri-arrow-left-long-line",
    "=>": "ri-arrow-right-long-line",
    "<=": "ri-arrow-left-long-line",
};

const ICON_MAP: Record<string, string> = { ...EMOJI_MAP, ...TEXT_MAP };

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ARROW_PATTERN = new RegExp(
    Object.keys(ICON_MAP)
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join("|"),
    "g",
);

export function applyArrowIconPlugin(md: MarkdownIt): void {
    md.core.ruler.push("arrow_icons", state => {
        for (const blockToken of state.tokens) {
            if (blockToken.type !== "inline" || !blockToken.children) continue;

            const children = blockToken.children;
            for (let i = 0; i < children.length; i++) {
                const token = children[i];
                if (token.type !== "text") continue;

                const matches = token.content.match(ARROW_PATTERN);
                if (!matches) continue;

                const parts = token.content.split(ARROW_PATTERN);
                const replacement: (typeof token)[] = [];

                parts.forEach((part, idx) => {
                    if (part) {
                        const textToken = new state.Token("text", "", 0);
                        textToken.content = part;
                        replacement.push(textToken);
                    }

                    const match = matches[idx];
                    if (match) {
                        const iconToken = new state.Token("html_inline", "", 0);
                        iconToken.content = `<i class="${ICON_MAP[match]} arrow-icon" aria-hidden="true"></i>`;
                        replacement.push(iconToken);
                    }
                });

                children.splice(i, 1, ...replacement);
                i += replacement.length - 1;
            }
        }

        return false;
    });
}
