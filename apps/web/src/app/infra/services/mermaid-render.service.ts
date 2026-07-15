import { inject, Injectable } from "@angular/core";
import { DOC_SITE_CONFIG } from "@infra/tokens";

interface MermaidApi {
    initialize(config: Record<string, unknown>): void;
    render(id: string, def: string): Promise<{ svg: string }>;
}

const ZOOM_STEP = 1.2;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 3;

@Injectable({
    providedIn: "root",
})
export class MermaidRenderService {
    #config = inject(DOC_SITE_CONFIG, { optional: true });
    #zoomLevels = new WeakMap<HTMLElement, number>();

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
                            this._wireZoom(block, renderEl);
                            this._wirePan(block, renderEl);
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

        svg.dataset["nativeWidth"] = String(viewBox.width);
        svg.dataset["nativeHeight"] = String(viewBox.height);
        svg.setAttribute("width", `${viewBox.width}px`);
        svg.setAttribute("height", `${viewBox.height}px`);
        svg.style.maxWidth = "none";
    }

    private _wireZoom(block: HTMLElement, renderEl: HTMLElement): void {
        const zoomIn = block.querySelector<HTMLButtonElement>(".mermaid-zoom-in");
        const zoomOut = block.querySelector<HTMLButtonElement>(".mermaid-zoom-out");
        if (!zoomIn || !zoomOut) return;

        this.#zoomLevels.set(block, 1);

        const applyZoom = (factor: number) => {
            const svg = renderEl.querySelector<SVGSVGElement>("svg");
            const nativeWidth = Number(svg?.dataset["nativeWidth"]);
            const nativeHeight = Number(svg?.dataset["nativeHeight"]);
            if (!svg || !nativeWidth || !nativeHeight) return;

            const current = this.#zoomLevels.get(block) ?? 1;
            const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current * factor));
            this.#zoomLevels.set(block, next);

            svg.setAttribute("width", `${nativeWidth * next}px`);
            svg.setAttribute("height", `${nativeHeight * next}px`);
        };

        zoomIn.addEventListener("click", () => applyZoom(ZOOM_STEP));
        zoomOut.addEventListener("click", () => applyZoom(1 / ZOOM_STEP));
    }

    private _wirePan(block: HTMLElement, renderEl: HTMLElement): void {
        let dragging = false;
        let startX = 0;
        let startScrollLeft = 0;

        renderEl.addEventListener("pointerdown", e => {
            dragging = true;
            startX = e.clientX;
            startScrollLeft = block.scrollLeft;
            renderEl.classList.add("is-panning");
            renderEl.setPointerCapture(e.pointerId);
        });

        renderEl.addEventListener("pointermove", e => {
            if (!dragging) return;
            block.scrollLeft = startScrollLeft - (e.clientX - startX);
        });

        const stopPanning = () => {
            dragging = false;
            renderEl.classList.remove("is-panning");
        };

        renderEl.addEventListener("pointerup", stopPanning);
        renderEl.addEventListener("pointercancel", stopPanning);
    }
}
