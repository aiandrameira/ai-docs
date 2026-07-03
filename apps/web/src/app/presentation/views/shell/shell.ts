import { DOCUMENT } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LayoutService } from "@infra/services";

import { DocBreadcrumb } from "../breadcrumb/breadcrumb";
import { DocContent } from "../content/content";
import { DocHeader } from "../header/header";
import { DocMobileMenu } from "../mobile-menu/mobile-menu";
import { DocPrevNext } from "../prev-next/prev-next";
import { DocSearch } from "../search/search";
import { DocSidebar } from "../sidebar/sidebar";
import { DocToc } from "../toc/toc";

@Component({
    selector: "doc-shell",
    imports: [DocHeader, DocSidebar, DocMobileMenu, DocContent, DocToc, DocBreadcrumb, DocPrevNext, DocSearch],
    templateUrl: "./shell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocShell {
    protected layout = inject(LayoutService);

    constructor() {
        const doc = inject(DOCUMENT);
        afterNextRender(() => doc.documentElement.classList.remove("no-flash"));
    }
}
