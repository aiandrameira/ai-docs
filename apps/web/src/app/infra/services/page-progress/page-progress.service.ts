import { AiLoaderService } from "@aiandralves/ai-ui";
import { DOCUMENT } from "@angular/common";
import { afterNextRender, DestroyRef, inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class PageProgressService {
    #document = inject(DOCUMENT);
    #destroyRef = inject(DestroyRef);
    #loader = inject(AiLoaderService);
    #navigationFrame: number | null = null;

    #handleClick = (event: MouseEvent): void => {
        const destination = this._getTrackedDestination(event);
        if (!destination) return;

        const window = this.#document.defaultView;
        if (!window) return;

        event.preventDefault();
        this.#loader.show();

        this.#navigationFrame = window.requestAnimationFrame(() => {
            this.#navigationFrame = window.requestAnimationFrame(() => window.location.assign(destination.href));
        });
    };

    #handleBeforeUnload = (): void => this.#loader.show();

    constructor() {
        this.#loader.reset();

        afterNextRender(() => {
            const window = this.#document.defaultView;
            if (!window) return;

            this.#document.addEventListener("click", this.#handleClick, { capture: true });
            window.addEventListener("beforeunload", this.#handleBeforeUnload);

            this.#destroyRef.onDestroy(() => {
                this.#document.removeEventListener("click", this.#handleClick, { capture: true });
                window.removeEventListener("beforeunload", this.#handleBeforeUnload);
                if (this.#navigationFrame !== null) window.cancelAnimationFrame(this.#navigationFrame);
                this.#loader.reset();
            });
        });
    }

    private _getTrackedDestination(event: MouseEvent): URL | null {
        if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return null;

        const target = event.target;
        if (!(target instanceof Element)) return null;

        const anchor = target.closest<HTMLAnchorElement>("a[href]");
        if (!anchor || anchor.hasAttribute("download") || anchor.target === "_blank") return null;

        const window = this.#document.defaultView;
        if (!window) return null;

        const destination = new URL(anchor.href, window.location.href);
        if (destination.origin !== window.location.origin) return null;

        const current = window.location;
        return destination.pathname !== current.pathname || destination.search !== current.search ? destination : null;
    }
}
