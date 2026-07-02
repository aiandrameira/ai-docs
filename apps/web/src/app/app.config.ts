import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

import { appRoutes } from "./app.routes";

function readDocContextFromDom() {
    if (typeof document === "undefined") return null;
    const el = document.getElementById("__DOC_CTX__");
    if (!el?.textContent) return null;
    try {
        const ctx = JSON.parse(el.textContent);
        if (ctx?.page) {
            const article = document.querySelector("article.doc-article");
            ctx.page.content = article?.innerHTML ?? "";
        }
        return ctx;
    } catch {
        return null;
    }
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        provideClientHydration(),
        { provide: DOC_PAGE_CONTEXT, useFactory: readDocContextFromDom },
        { provide: DOC_SITE_CONFIG, useFactory: () => readDocContextFromDom()?.config ?? null },
    ],
};
