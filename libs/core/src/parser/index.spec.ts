import { describe, expect, it } from "vitest";

import { interpolateVariables, parseFile } from "./index";

describe("interpolateVariables", () => {
    it("replaces configured Markdown variables", () => {
        expect(interpolateVariables("Versão {{AI_DOCS_VERSION}}", { AI_DOCS_VERSION: "0.0.9" })).toBe("Versão 0.0.9");
    });

    it("keeps unknown variables unchanged", () => {
        expect(interpolateVariables("{{UNKNOWN_VERSION}}", { AI_DOCS_VERSION: "0.0.9" })).toBe("{{UNKNOWN_VERSION}}");
    });

    it("stores and renders the interpolated Markdown", () => {
        const page = parseFile("docs/versions.md", "# Versão {{AI_DOCS_VERSION}}", "docs", {
            variables: { AI_DOCS_VERSION: "0.0.9" },
        });

        expect(page.rawContent).toBe("# Versão 0.0.9");
        expect(page.content).toContain("Versão 0.0.9");
        expect(page.content).not.toContain("{{AI_DOCS_VERSION}}");
    });
});
