import { DOCUMENT } from "@angular/common";
import { afterNextRender, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LayoutService } from "@infra/services";
import { DOC_PAGE_CONTEXT } from "@infra/tokens";

import { DocBreadcrumb } from "../breadcrumb/breadcrumb";
import { DocContent } from "../content/content";
import { DocHeader } from "../header/header";
import { DocHome } from "../home/home";
import { DocMobileMenu } from "../mobile-menu/mobile-menu";
import { DocPrevNext } from "../prev-next/prev-next";
import { DocSearch } from "../search/search";
import { DocSidebar } from "../sidebar/sidebar";
import { DocToc } from "../toc/toc";

@Component({
    selector: "doc-shell",
    imports: [DocHeader, DocSidebar, DocMobileMenu, DocContent, DocToc, DocBreadcrumb, DocPrevNext, DocSearch, DocHome],
    templateUrl: "./shell.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocShell {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected layout = inject(LayoutService);
    protected isHome = this.#ctx?.page?.slug === "";

    constructor() {
        const doc = inject(DOCUMENT);
        afterNextRender(() => doc.documentElement.classList.remove("no-flash"));
    }
}
