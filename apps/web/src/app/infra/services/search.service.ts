import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { SearchEntry } from "@libs/core";

@Injectable({
    providedIn: "root",
})
export class SearchService {
    #isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    #index: SearchEntry[] = [];
    #fuse: any = null;
    #loading: Promise<void> | null = null;

    async ensureLoaded(): Promise<void> {
        if (!this.#isBrowser || this.#fuse) return;
        this.#loading ??= this._load();
        return this.#loading;
    }

    getAll(limit = 20): SearchEntry[] {
        return this.#index.slice(0, limit);
    }

    search(query: string, limit = 8): SearchEntry[] {
        if (!this.#fuse || query.length < 2) return [];
        const hits = this.#fuse.search(query, { limit }) as Array<{ item: SearchEntry }>;
        return hits.map(hit => hit.item);
    }

    private async _load(): Promise<void> {
        const response = await fetch("/assets/search-index.json");
        if (!response.ok) return;
        this.#index = (await response.json()) as SearchEntry[];

        const Fuse = (await import("fuse.js")).default;
        this.#fuse = new Fuse(this.#index, {
            keys: [
                { name: "title", weight: 0.6 },
                { name: "description", weight: 0.25 },
                { name: "content", weight: 0.15 },
            ],
            threshold: 0.35,
            includeScore: true,
        });
    }
}
