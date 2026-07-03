import { Injectable } from "@angular/core";

interface MermaidApi {
    initialize(config: Record<string, unknown>): void;
    render(id: string, def: string): Promise<{ svg: string }>;
}

@Injectable({
    providedIn: "root",
})
export class MermaidRenderService {
    renderAll(doc: Document): void {
        const blocks = doc.querySelectorAll<HTMLElement>(".mermaid-block");
        if (!blocks.length) return;

        import("/assets/mermaid.esm.min.mjs" as string)
            .then(m => {
                const mermaid = (m as { default: MermaidApi }).default;
                mermaid.initialize({ startOnLoad: false, theme: "neutral" });

                blocks.forEach(block => {
                    const encoded = block.dataset["mermaid"] ?? "";
                    const def = decodeURIComponent(encoded);
                    const renderEl = block.querySelector<HTMLElement>(".mermaid-render");
                    if (!renderEl) return;

                    const id = "mermaid-" + Math.random().toString(36).slice(2);
                    mermaid.render(id, def).then(r => {
                        renderEl.innerHTML = r.svg;
                    });
                });
            })
            .catch(() => {
                blocks.forEach(block => {
                    const src = block.querySelector<HTMLElement>(".mermaid-source");
                    if (src) src.style.display = "block";
                    const loader = block.querySelector<HTMLElement>(".mermaid-loading");
                    if (loader) loader.textContent = "Mermaid não disponível";
                });
            });
    }
}
