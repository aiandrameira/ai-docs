import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { LayoutService } from "@infra/services";

import { DocLogo } from "../logo/logo";
import { DocSidebar } from "../sidebar/sidebar";

@Component({
    selector: "doc-mobile-menu",
    imports: [DocSidebar, DocLogo],
    templateUrl: "./mobile-menu.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocMobileMenu {
    #layout = inject(LayoutService);

    protected mobileMenuOpen = this.#layout.mobileMenuOpen;

    close() {
        this.#layout.close();
    }
}
