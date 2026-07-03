import { AiIcon, ClipboardUtil } from "@aiandralves/ai-ui";
import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";

const COPIED_TIMEOUT_MS = 2000;

@Component({
    selector: "doc-copier",
    imports: [AiIcon],
    template: `
        <button class="copy-code-btn" [class.copied]="copied()" (click)="copyCode()">
            <ai-icon [icon]="copied() ? 'check-double' : 'file-copy'" size="xs" />
            {{ copied() ? "Copiado" : "Copiar" }}
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocCopier {
    code = input<string>("");

    protected copied = signal(false);

    protected async copyCode(): Promise<void> {
        await ClipboardUtil.copy(this.code());
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), COPIED_TIMEOUT_MS);
    }
}
