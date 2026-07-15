import { inject, Injectable } from "@angular/core";
import { DOC_SITE_CONFIG } from "@infra/tokens";

interface MermaidApi {
    initialize(config: Record<string, unknown>): void;
    render(id: string, def: string): Promise<{ svg: string }>;
}

@Injectable({
    providedIn: "root",
})
export class MermaidRenderService {
    #config = inject(DOC_SITE_CONFIG, { optional: true });

    renderAll(doc: Document): void {
        const blocks = doc.querySelectorAll<HTMLElement>(".mermaid-block");
        if (!blocks.length) return;

        const base = this.#config?.base ?? "/";
        const assetUrl = `${base.endsWith("/") ? base : `${base}/`}assets/mermaid.esm.min.mjs`;

        import(assetUrl)
            .then(m => {
                const mermaid = (m as { default: MermaidApi }).default;
                mermaid.initialize({ startOnLoad: false, theme: "neutral" });

                blocks.forEach(block => {
                    const encoded = block.dataset["mermaid"] ?? "";
                    const def = decodeURIComponent(encoded);
                    const renderEl = block.querySelector<HTMLElement>(".mermaid-render");
                    if (!renderEl) return;

                    const id = "mermaid-" + Math.random().toString(36).slice(2);
                    mermaid
                        .render(id, def)
                        .then(r => {
                            renderEl.innerHTML = r.svg;
                            this._sizeToNative(renderEl);
                        })
                        .catch(err => {
                            console.error("Mermaid render error:", err);
                            renderEl.textContent = "Erro ao renderizar diagrama";
                            const src = block.querySelector<HTMLElement>(".mermaid-source");
                            if (src) src.style.display = "block";
                        });
                });
            })
            .catch(err => {
                console.error("Mermaid load error:", err);
                blocks.forEach(block => {
                    const src = block.querySelector<HTMLElement>(".mermaid-source");
                    if (src) src.style.display = "block";
                    const loader = block.querySelector<HTMLElement>(".mermaid-loading");
                    if (loader) loader.textContent = "Mermaid não disponível";
                });
            });
    }

    private _sizeToNative(renderEl: HTMLElement): void {
        const svg = renderEl.querySelector("svg");
        const viewBox = svg?.viewBox?.baseVal;
        if (!svg || !viewBox?.width || !viewBox?.height) return;

        svg.setAttribute("width", `${viewBox.width}px`);
        svg.setAttribute("height", `${viewBox.height}px`);
        svg.style.maxWidth = "none";
    }
}
