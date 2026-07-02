import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type { BundledLanguage, BundledTheme, Highlighter } from "shiki";

export interface ShikiOptions {
    light?: BundledTheme;
    dark?: BundledTheme;
    langs?: BundledLanguage[];
}

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(opts: ShikiOptions): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = import("shiki").then(({ createHighlighter }) =>
            createHighlighter({
                themes: [opts.light ?? "github-light", opts.dark ?? "github-dark"],
                langs: opts.langs ?? [
                    "typescript",
                    "javascript",
                    "tsx",
                    "jsx",
                    "html",
                    "css",
                    "scss",
                    "json",
                    "yaml",
                    "toml",
                    "bash",
                    "sh",
                    "shell",
                    "markdown",
                    "mdx",
                    "sql",
                    "graphql",
                    "python",
                    "rust",
                    "go",
                ],
            }),
        );
    }
    return highlighterPromise;
}

export async function applyShikiPlugin(md: MarkdownIt, opts: ShikiOptions = {}): Promise<void> {
    const highlighter = await getHighlighter(opts);
    const light = opts.light ?? "github-light";
    const dark = opts.dark ?? "github-dark";

    md.renderer.rules["fence"] = (tokens: Token[], idx: number) => {
        const token = tokens[idx];
        const rawLang = token.info.trim().split(/\s+/)[0] || "text";
        const code = token.content;

        let highlighted: string;
        try {
            highlighted = highlighter.codeToHtml(code, {
                lang: rawLang as BundledLanguage,
                themes: { light, dark },
                defaultColor: false,
            });
        } catch {
            const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            highlighted = `<pre class="shiki"><code>${escaped}</code></pre>`;
        }

        return `<div class="code-block" data-lang="${rawLang}">
    <button class="copy-code-btn" aria-label="Copiar código" data-code="${encodeURIComponent(code)}">
        <i class="ri-file-copy-line"></i> Copiar
    </button>
    ${highlighted}
</div>\n`;
    };
}

export function resetHighlighter(): void {
    highlighterPromise = null;
}
