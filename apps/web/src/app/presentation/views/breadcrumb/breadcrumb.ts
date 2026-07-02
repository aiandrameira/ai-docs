import { AiBreadcrumbModule } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOC_PAGE_CONTEXT } from "@infra/tokens";

@Component({
    selector: "doc-breadcrumb",
    imports: [AiBreadcrumbModule],
    template: `
        @if (crumbs.length > 1) {
            <ai-breadcrumb-content class="mb-6">
                <ai-breadcrumb-list>
                    @for (crumb of crumbs; track crumb.title; let last = $last) {
                        <ai-breadcrumb-item>
                            @if (!last) {
                                <ai-breadcrumb-link [link]="crumb.href ?? ''">
                                    {{ crumb.title }}
                                </ai-breadcrumb-link>
                            } @else {
                                <ai-breadcrumb-page>{{ crumb.title }}</ai-breadcrumb-page>
                            }
                        </ai-breadcrumb-item>
                        @if (!last) {
                            <ai-breadcrumb-separator />
                        }
                    }
                </ai-breadcrumb-list>
            </ai-breadcrumb-content>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocBreadcrumb {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected crumbs = this.#ctx?.breadcrumb ?? [];
}
