import { AiButton } from "@aiandralves/ai-ui";
import { DOCUMENT } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

interface MermaidApi {
    initialize(config: Record<string, unknown>): void;
    render(id: string, def: string): Promise<{ svg: string }>;
}

@Component({
    selector: "doc-content",
    imports: [AiButton],
    templateUrl: "./content.html",
    styleUrl: "./content.scss",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocContent {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    #siteConfig = inject(DOC_SITE_CONFIG, { optional: true });
    #sanitizer = inject(DomSanitizer);

    constructor() {
        const doc = inject(DOCUMENT);
        afterNextRender(() => this._initMermaid(doc));
    }

    protected get safeHtml(): SafeHtml {
        return this.#sanitizer.bypassSecurityTrustHtml(this.#ctx?.page?.content ?? "");
    }

    protected get editHref(): string | null {
        const eog = this.#siteConfig?.features?.editOnGitHub;
        if (!eog) return null;
        const slug = this.#ctx?.page?.slug ?? "";
        const filePath = slug ? `${slug}.md` : "index.md";
        return `${eog.repo}/blob/${eog.branch}/${eog.docsDir}/${filePath}`;
    }

    private _initMermaid(doc: Document): void {
        const blocks = doc.querySelectorAll<HTMLElement>(".mermaid-block");
        if (!blocks.length) return;

        import("/assets/mermaid.esm.min.mjs" as string)
            .then(m => {
                (m as { default: MermaidApi }).default.initialize({ startOnLoad: false, theme: "neutral" });
                blocks.forEach(block => {
                    const encoded = block.dataset["mermaid"] ?? "";
                    const def = decodeURIComponent(encoded);
                    const renderEl = block.querySelector<HTMLElement>(".mermaid-render");
                    if (!renderEl) return;
                    const id = "mermaid-" + Math.random().toString(36).slice(2);
                    (m as { default: MermaidApi }).default.render(id, def).then((r: { svg: string }) => {
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
