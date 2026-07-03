import { AiIcon } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

@Component({
    selector: "doc-logo",
    imports: [AiIcon],
    templateUrl: "./logo.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocLogo {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected config = inject(DOC_SITE_CONFIG, { optional: true }) ?? this.#ctx?.config;
}
