import { AiLoader } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { PageProgressService } from "@infra/services";

@Component({
    selector: "doc-page-progress",
    imports: [AiLoader],
    template: `<ai-loader type="progress" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageProgress {
    readonly pageProgress = inject(PageProgressService);
}
