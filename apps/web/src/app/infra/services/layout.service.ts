import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class LayoutService {
    readonly mobileMenuOpen = signal<boolean>(false);

    toggle() {
        this.mobileMenuOpen.update(v => !v);
    }

    close() {
        this.mobileMenuOpen.set(false);
    }
}
