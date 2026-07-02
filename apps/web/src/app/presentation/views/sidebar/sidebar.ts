import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOC_PAGE_CONTEXT } from "@infra/tokens";

import { DocSidebarItem } from "./sidebar-item";

@Component({
    selector: "doc-sidebar",
    imports: [DocSidebarItem],
    templateUrl: "./sidebar.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocSidebar {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected sidebar = this.#ctx?.sidebar ?? [];
}
