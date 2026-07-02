import nx from "@nx/eslint-plugin";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
        ignores: ["**/dist", "node_modules/**", ".nx/**", "**/vite.config.*.timestamp*", ".angular/**", "**/vitest.config.*.timestamp*"],
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            "no-useless-constructor": "off",
            "no-void": "off",
            "prettier/prettier": "error",
        },
    },
];
