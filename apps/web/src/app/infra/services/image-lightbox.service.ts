import { Injectable, signal } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ImageLightboxService {
    readonly open = signal(false);
    readonly src = signal("");
    readonly alt = signal("");

    show(src: string, alt: string): void {
        this.src.set(src);
        this.alt.set(alt);
        this.open.set(true);
    }

    close(): void {
        this.open.set(false);
    }
}
