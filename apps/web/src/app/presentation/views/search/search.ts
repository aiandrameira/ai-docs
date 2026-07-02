import { AiCommand, AiCommandEmpty, AiCommandInput, AiCommandItem, AiCommandList } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, effect, ElementRef, HostListener, inject, OnInit, signal, viewChild } from "@angular/core";
import { SearchService } from "@infra/services";
import { DOC_SITE_CONFIG } from "@infra/tokens";
import { SearchEntry } from "@libs/core";

@Component({
    selector: "doc-search",
    imports: [AiCommand, AiCommandInput, AiCommandList, AiCommandItem, AiCommandEmpty],
    templateUrl: "./search.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocSearch implements OnInit {
    private dialog = viewChild<ElementRef<HTMLDivElement>>("dialog");
    private cmd = viewChild<AiCommand>("cmd");

    #config = inject(DOC_SITE_CONFIG, { optional: true });
    #search = inject(SearchService);

    protected open = signal(false);
    protected query = signal("");
    protected results = signal<SearchEntry[]>([]);

    constructor() {
        effect(() => {
            const term = this.cmd()?.searchTerm() ?? "";
            this.query.set(term);
            this.results.set(term.length >= 2 ? this.#search.search(term) : this.#search.getAll());
        });
    }

    ngOnInit(): void {
        if (!this.#config?.features?.search) return;
        this.#search.ensureLoaded();
    }

    @HostListener("document:keydown", ["$event"])
    onGlobalKeydown(event: KeyboardEvent): void {
        if ((event.metaKey || event.ctrlKey) && event.key === "k") {
            event.preventDefault();
            this.open.set(true);
            setTimeout(() => this.cmd()?.focus(), 0);
        }
    }

    protected onSelect(item: { value: unknown }): void {
        window.location.href = "/" + item.value;
    }

    protected close(event?: Event): void {
        if (event) {
            const target = event.target as HTMLElement;
            if (this.dialog()?.nativeElement.contains(target)) return;
        }
        this.open.set(false);
        this.query.set("");
        this.results.set([]);
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape") this.close();
    }
}
