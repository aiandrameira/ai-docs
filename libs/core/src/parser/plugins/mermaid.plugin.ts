import type MarkdownIt from "markdown-it";

export function applyMermaidPlugin(md: MarkdownIt): void {
    const originalFence = md.renderer.rules["fence"];

    md.renderer.rules["fence"] = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const lang = token.info.trim().split(/\s+/)[0];

        if (lang === "mermaid") {
            const escaped = token.content.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            return `<div class="mermaid-block" data-mermaid="${encodeURIComponent(token.content.trim())}">
    <pre class="mermaid-source">${escaped}</pre>
    <div class="mermaid-render" aria-label="Diagrama Mermaid">
        <span class="mermaid-loading">Carregando diagrama...</span>
    </div>
</div>\n`;
        }

        return originalFence ? originalFence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
    };
}
