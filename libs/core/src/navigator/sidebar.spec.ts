import { describe, expect, it } from "vitest";

import { buildSidebar } from "./sidebar";

import type { DocPage } from "../types";

function makePage(slug: string, title: string, order = 999): DocPage {
    return {
        slug,
        filePath: `docs/${slug || "index"}.md`,
        frontMatter: { title, order },
        content: "",
        rawContent: "",
    };
}

describe("buildSidebar", () => {
    it("preserves directories nested at arbitrary depths", () => {
        const sidebar = buildSidebar([makePage("", "Início", 1), makePage("utility/auth/login", "Login", 2)], "utility/auth/login");

        expect(sidebar).toEqual([
            { title: "Início", href: "/", order: 1, active: false },
            {
                title: "Utility",
                href: "/utility",
                order: 2,
                active: true,
                children: [
                    {
                        title: "Auth",
                        href: "/utility/auth",
                        order: 2,
                        active: true,
                        children: [{ title: "Login", href: "/utility/auth/login", order: 2, active: true }],
                    },
                ],
            },
        ]);
    });

    it("uses directory index metadata for its group", () => {
        const sidebar = buildSidebar([makePage("utility", "Utilitários", 1), makePage("utility/auth/login", "Login", 3)]);

        expect(sidebar[0]).toMatchObject({ title: "Utilitários", href: "/utility", order: 1 });
        expect(sidebar[0].children?.[0]).toMatchObject({ title: "Auth", href: "/utility/auth" });
    });
});
