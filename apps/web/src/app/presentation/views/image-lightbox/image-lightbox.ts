import { AiIcon } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal, viewChild } from "@angular/core";
import { ImageLightboxService } from "@infra/services";

const ZOOM_STEP = 1.25;
const ZOOM_MIN = 1;
const ZOOM_MAX = 5;

@Component({
    selector: "doc-image-lightbox",
    imports: [AiIcon],
    templateUrl: "./image-lightbox.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocImageLightbox {
    protected lightbox = inject(ImageLightboxService);

    private dialog = viewChild<ElementRef<HTMLDivElement>>("dialog");

    protected zoom = signal(1);
    protected translate = signal({ x: 0, y: 0 });

    #dragging = false;
    #dragStart = { x: 0, y: 0 };
    #translateStart = { x: 0, y: 0 };

    protected zoomIn(): void {
        this.zoom.update(z => Math.min(ZOOM_MAX, z * ZOOM_STEP));
    }

    protected zoomOut(): void {
        this.zoom.update(z => {
            const next = Math.max(ZOOM_MIN, z / ZOOM_STEP);
            if (next === ZOOM_MIN) this.translate.set({ x: 0, y: 0 });
            return next;
        });
    }

    protected onWheel(event: WheelEvent): void {
        event.preventDefault();
        if (event.deltaY < 0) this.zoomIn();
        else this.zoomOut();
    }

    protected onPointerDown(event: PointerEvent): void {
        if (this.zoom() === ZOOM_MIN) return;
        this.#dragging = true;
        this.#dragStart = { x: event.clientX, y: event.clientY };
        this.#translateStart = this.translate();
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    protected onPointerMove(event: PointerEvent): void {
        if (!this.#dragging) return;
        this.translate.set({
            x: this.#translateStart.x + (event.clientX - this.#dragStart.x),
            y: this.#translateStart.y + (event.clientY - this.#dragStart.y),
        });
    }

    protected onPointerUp(): void {
        this.#dragging = false;
    }

    protected close(event?: Event): void {
        if (event) {
            const target = event.target as HTMLElement;
            if (this.dialog()?.nativeElement.contains(target)) return;
        }
        this.lightbox.close();
        this.zoom.set(1);
        this.translate.set({ x: 0, y: 0 });
    }

    @HostListener("document:keydown", ["$event"])
    onKeydown(event: KeyboardEvent): void {
        if (!this.lightbox.open() || event.key !== "Escape") return;
        this.close();
    }
}
