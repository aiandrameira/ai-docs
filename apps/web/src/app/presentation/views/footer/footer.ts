import { AiBadge, AiButton, AiSeparator } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { environment } from "@env/environment.development";

@Component({
    selector: "doc-footer",
    imports: [AiButton, AiSeparator, AiBadge],
    templateUrl: "./footer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocFooter {
    protected readonly message = "Feito com ❤️ por @aiandrameira. Código aberto";
    protected readonly copyright = "© 2026 Aiandra Alves";
    protected readonly social = {
        github: "https://github.com/aiandrameira/ai-docs",
        linkedin: "https://www.linkedin.com/in/aiandralves/",
        npnpmjs: "https://www.npmjs.com/package/@aiandralves/ai-ui",
    };
    protected version = environment.version;
}
