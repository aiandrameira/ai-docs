import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";

import type { SidebarItem } from "@libs/core";

@Component({
    selector: "doc-sidebar-item",
    imports: [NgClass, DocSidebarItem],
    templateUrl: "./sidebar-item.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocSidebarItem {
    item = input.required<SidebarItem>();

    protected readonly activeClass = "bg-ghost text-primary font-semibold border-l-2 border-primary rounded-sm";
}
