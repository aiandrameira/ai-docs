import { Route } from "@angular/router";

import { DocShell } from "./presentation/views/shell/shell";

export const appRoutes: Route[] = [{ path: "**", component: DocShell }];
