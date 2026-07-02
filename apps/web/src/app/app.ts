import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
    imports: [RouterModule],
    selector: "app-root",
    styles: [
        `
            :host {
                display: block;
                min-height: 100vh;
            }
        `,
    ],
    template: `<router-outlet />`,
})
export class App {}
