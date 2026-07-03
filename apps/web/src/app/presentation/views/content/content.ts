import { AiButton } from "@aiandralves/ai-ui";
import { DOCUMENT } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, inject, OnDestroy, ViewEncapsulation } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { CopierMountService, MermaidRenderService } from "@infra/services";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

@Component({
    selector: "doc-content",
    imports: [AiButton],
    templateUrl: "./content.html",
    styleUrl: "./content.scss",
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocContent implements OnDestroy {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    #siteConfig = inject(DOC_SITE_CONFIG, { optional: true });
    #sanitizer = inject(DomSanitizer);
    #copierMount = inject(CopierMountService);
    #mermaidRender = inject(MermaidRenderService);

    constructor() {
        const doc = inject(DOCUMENT);
        afterNextRender(() => {
            this.#mermaidRender.renderAll(doc);
            this.#copierMount.mountAll(doc);
        });
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

    ngOnDestroy(): void {
        this.#copierMount.destroyAll();
    }
}
