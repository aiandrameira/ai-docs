import { AiIcon } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOC_PAGE_CONTEXT } from "@infra/tokens";

@Component({
    selector: "doc-prev-next",
    imports: [AiIcon],
    templateUrl: "./prev-next.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPrevNext {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected prev = this.#ctx?.prev;
    protected next = this.#ctx?.next;
}
