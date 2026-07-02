import { InjectionToken } from "@angular/core";

import type { PageContext, SiteConfig } from "@libs/core";

export const DOC_PAGE_CONTEXT = new InjectionToken<PageContext>("DOC_PAGE_CONTEXT");
export const DOC_SITE_CONFIG = new InjectionToken<SiteConfig>("DOC_SITE_CONFIG");
