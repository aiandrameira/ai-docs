import baseConfig from "../../eslint.config.mjs";

export default [
    ...baseConfig,
    {
        files: ["**/*.json"],
        rules: {
            "@nx/dependency-checks": [
                "error",
                {
                    ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
                    // mermaid is only resolved at runtime via `require.resolve` (copier.ts), not statically imported.
                    ignoredDependencies: ["mermaid"],
                },
            ],
        },
        languageOptions: {
            parser: await import("jsonc-eslint-parser"),
        },
    },
];
