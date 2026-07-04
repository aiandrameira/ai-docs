import { AiButton, AiIcon, AiIconType } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOC_PAGE_CONTEXT, DOC_SITE_CONFIG } from "@infra/tokens";

import { DocFooter } from "../footer/footer";

interface HomeAction {
    label: string;
    href: string;
    variant: "primary" | "outline";
    icon?: AiIconType;
    external?: boolean;
}

interface HomeFeature {
    icon: AiIconType;
    title: string;
    details: string;
}

interface MarqueeItem extends HomeFeature {
    key: string;
    duplicate: boolean;
}

const MARQUEE_COPIES = 4;

@Component({
    selector: "doc-home",
    imports: [AiButton, AiIcon, DocFooter],
    templateUrl: "./home.html",
    styleUrl: "./home.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocHome {
    #ctx = inject(DOC_PAGE_CONTEXT, { optional: true });
    protected config = inject(DOC_SITE_CONFIG, { optional: true }) ?? this.#ctx?.config;

    protected readonly announcement = "Angular SSR + tema centralizado em componentes";

    protected readonly actions: HomeAction[] = [
        { label: "Começar agora", href: "/introduction", variant: "primary", icon: "rocket-2" },
        { label: "GitHub", href: "https://github.com/aiandrameira/ai-docs", variant: "outline", icon: "github", external: true },
    ];

    protected readonly features: HomeFeature[] = [
        {
            icon: "code-s-slash",
            title: "Syntax highlight server-side",
            details: "Shiki roda no build — zero JavaScript extra no cliente pra destacar código.",
        },
        {
            icon: "search-eye",
            title: "Busca fuzzy",
            details: "Fuse.js via paleta de comandos (⌘K / Ctrl+K), sem servidor de busca.",
        },
        {
            icon: "mind-map",
            title: "Diagramas Mermaid",
            details: "Renderizados sob demanda, direto no Markdown.",
        },
        {
            icon: "moon",
            title: "Dark mode sem flash",
            details: "Script inline detecta o tema antes da primeira renderização.",
        },
        {
            icon: "server",
            title: "Angular SSR",
            details: "HTML pré-renderizado, hydration no cliente, tema centralizado em componentes.",
        },
        {
            icon: "terminal",
            title: "Um comando",
            details: "`ai-docs init` e `ai-docs build` — sem configuração extra.",
        },
    ];

    protected readonly marqueeItems: MarqueeItem[] = Array.from({ length: MARQUEE_COPIES }, (_, copy) =>
        this.features.map(feature => ({ ...feature, key: `${feature.title}-${copy}`, duplicate: copy > 0 })),
    ).flat();
}
