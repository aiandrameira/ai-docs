import { isPlatformBrowser, NgTemplateOutlet } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, NgZone, OnDestroy, PLATFORM_ID, signal } from "@angular/core";
import { DOC_PAGE_CONTEXT } from "@infra/tokens";

import type { TocItem } from "@libs/core";

@Component({
    selector: "doc-toc",
    imports: [NgTemplateOutlet],
    templateUrl: "./toc.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocToc implements AfterViewInit, OnDestroy {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    #zone = inject(NgZone);
    #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    protected toc = this.#ctx?.toc ?? [];
    protected activeId = signal<string | null>(null);

    #observer: IntersectionObserver | null = null;
    #intersecting = new Map<string, boolean>();

    protected tocLinkClass(id: string, level: number): string {
        const base = "block text-xs text-muted-foreground px-2 py-1 transition-colors leading-snug hover:text-primary";
        const active = id === this.activeId() ? " text-primary underline font-semibold" : "";
        const indent = level === 3 ? " pl-5" : level === 4 ? " pl-8" : "";
        return base + active + indent;
    }

    ngAfterViewInit() {
        if (!this.#isBrowser || !this.toc.length) return;
        this.#zone.runOutsideAngular(() => {
            const ids = this._flattenIds(this.toc);
            const elements = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

            this.#observer = new IntersectionObserver(
                entries => {
                    for (const entry of entries) {
                        this.#intersecting.set(entry.target.id, entry.isIntersecting);
                    }
                    const active = ids.find(id => this.#intersecting.get(id));
                    if (active && active !== this.activeId()) {
                        this.activeId.set(active);
                    }
                },
                { rootMargin: "-57px 0px -80% 0px", threshold: 0 },
            );
            elements.forEach(el => {
                if (!this.#observer) return;
                this.#observer.observe(el);
            });
        });
    }

    ngOnDestroy() {
        this.#observer?.disconnect();
    }

    private _flattenIds(items: TocItem[]): string[] {
        return items.flatMap(item => [item.id, ...this._flattenIds(item.children)]);
    }
}
