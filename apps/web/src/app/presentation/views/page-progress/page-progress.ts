import { AiProgressBar } from "@aiandralves/ai-ui";
import { DOCUMENT } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";

@Component({
    selector: "doc-page-progress",
    imports: [AiProgressBar],
    template: `
        @if (loading()) {
            <div class="fixed inset-x-0 top-0 z-50" aria-label="Carregando página">
                <ai-progress-bar variant="accent" size="sm" [indeterminate]="true" class="w-full rounded-none" />
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageProgress {
    #document = inject(DOCUMENT);
    #destroyRef = inject(DestroyRef);
    protected readonly loading = signal(false);

    #handleClick = (event: MouseEvent): void => {
        if (!this._shouldTrack(event)) return;
        this.loading.set(true);
    };

    #handleBeforeUnload = (): void => this.loading.set(true);

    constructor() {
        afterNextRender(() => {
            const window = this.#document.defaultView;
            if (!window) return;

            this.#document.addEventListener("click", this.#handleClick, { capture: true });
            window.addEventListener("beforeunload", this.#handleBeforeUnload);

            this.#destroyRef.onDestroy(() => {
                this.#document.removeEventListener("click", this.#handleClick, { capture: true });
                window.removeEventListener("beforeunload", this.#handleBeforeUnload);
            });
        });
    }

    private _shouldTrack(event: MouseEvent): boolean {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return false;

        const target = event.target;
        if (!(target instanceof Element)) return false;

        const anchor = target.closest<HTMLAnchorElement>("a[href]");
        if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank") return false;

        const window = this.#document.defaultView;
        if (!window) return false;

        const destination = new URL(anchor.href, window.location.href);
        if (destination.origin !== window.location.origin) return false;

        const current = window.location;
        return destination.pathname !== current.pathname || destination.search !== current.search;
    }
}
