import { AiButton, AiIcon, ThemeStore } from "@aiandralves/ai-ui";
import { isPlatformBrowser } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject, PLATFORM_ID } from "@angular/core";
import { LayoutService } from "@infra/services";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

import { DocLogo } from "../logo/logo";

@Component({
    selector: "doc-header",
    imports: [AiButton, AiIcon, DocLogo],
    templateUrl: "./header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocHeader {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected config = inject(DOC_SITE_CONFIG, { optional: true }) ?? this.#ctx?.config;
    #layout = inject(LayoutService);
    #themeStore = isPlatformBrowser(inject(PLATFORM_ID)) ? inject(ThemeStore) : null;

    protected toggle = this.#layout.toggle;
    protected mobileMenuOpen = this.#layout.mobileMenuOpen;
    protected isDark = computed(() => this.#themeStore?.theme() === "dark");

    protected toggleDark(): void {
        this.#themeStore?.changeTo(this.isDark() ? "light" : "dark");
    }

    protected openSearch(): void {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
    }
}
