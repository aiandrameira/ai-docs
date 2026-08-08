import { inject, Injectable } from "@angular/core";
import { ImageLightboxService } from "./image-lightbox.service";

@Injectable({
    providedIn: "root",
})
export class ImageZoomMountService {
    #lightbox = inject(ImageLightboxService);

    mountAll(doc: Document): void {
        const images = doc.querySelectorAll<HTMLImageElement>(".doc-article img");

        images.forEach(img => {
            img.classList.add("zoomable-image");
            img.addEventListener("click", () => this.#lightbox.show(img.currentSrc || img.src, img.alt));
        });
    }
}
