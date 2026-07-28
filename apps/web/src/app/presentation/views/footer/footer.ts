import { AiButton } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "doc-footer",
    imports: [AiButton],
    templateUrl: "./footer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocFooter {
    protected readonly message = "Feito com ❤️ por @aiandralves. Código aberto | © 2026.";
    protected readonly social = {
        github: "https://github.com/aiandrameira",
        linkedin: "https://www.linkedin.com/in/aiandralves/",
        npm: "https://www.npmjs.com/package/@aiandralves/ai-docs",
    };
}
