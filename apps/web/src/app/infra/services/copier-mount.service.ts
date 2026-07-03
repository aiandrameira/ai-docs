import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable } from "@angular/core";

import { DocCopier } from "../../presentation/views/copier/copier";

@Injectable({
    providedIn: "root",
})
export class CopierMountService {
    #appRef = inject(ApplicationRef);
    #envInjector = inject(EnvironmentInjector);
    #refs: ComponentRef<DocCopier>[] = [];

    mountAll(doc: Document): void {
        const buttons = doc.querySelectorAll<HTMLElement>(".copy-code-btn");

        buttons.forEach(btn => {
            const code = decodeURIComponent(btn.dataset["code"] ?? "");
            const ref = createComponent(DocCopier, { environmentInjector: this.#envInjector });

            ref.setInput("code", code);
            this.#appRef.attachView(ref.hostView);
            btn.replaceWith(ref.location.nativeElement);
            this.#refs.push(ref);
        });
    }

    destroyAll(): void {
        this.#refs.forEach(ref => ref.destroy());
        this.#refs = [];
    }
}
