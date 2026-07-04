import { createJiti } from "jiti";
import * as path from "path";
import { z } from "zod";

export interface SiteConfig {
    title: string;
    description?: string;
    logo?: string;
    favicon?: string;
    github?: string;
    docs: string;
    output: string;
    base: string;
    nav?: Array<{ label: string; href: string; external?: boolean }>;
    theme?: {
        primaryColor?: string;
        accentColor?: string;
        codeTheme?: { light: string; dark: string };
        customCss?: string;
    };
    features?: {
        search?: boolean;
        darkMode?: boolean;
        copyCode?: boolean;
        mermaid?: boolean;
        editOnGitHub?: { repo: string; branch: string; docsDir: string };
    };
    plugins?: unknown[];
}

const EditOnGitHubSchema = z.object({
    repo: z.string().min(1),
    branch: z.string().default("main"),
    docsDir: z.string().default("docs"),
});

const SiteConfigSchema = z.object({
    title: z.string().min(1).describe("Title is required and must be a non-empty string."),
    description: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    github: z.string().optional(),
    docs: z.string().default("./docs"),
    output: z.string().default("./dist"),
    base: z.string().default("/"),
    nav: z
        .array(
            z.object({
                label: z.string(),
                href: z.string(),
                external: z.boolean().optional(),
            }),
        )
        .optional(),
    theme: z
        .object({
            primaryColor: z.string().optional(),
            accentColor: z.string().optional(),
            codeTheme: z.object({ light: z.string(), dark: z.string() }).optional(),
            customCss: z.string().optional(),
        })
        .optional(),
    features: z
        .object({
            search: z.boolean().optional(),
            darkMode: z.boolean().optional(),
            copyCode: z.boolean().optional(),
            mermaid: z.boolean().optional(),
            editOnGitHub: EditOnGitHubSchema.optional(),
        })
        .optional(),
    plugins: z.array(z.any()).optional(),
});

export function defineConfig(config: SiteConfig): SiteConfig {
    return config;
}

export async function loadConfig(configPath: string): Promise<SiteConfig> {
    const resolved = path.resolve(configPath);
    const jiti = createJiti(__filename);

    let rawConfig: unknown;
    try {
        const mod = (await jiti.import(resolved)) as { default?: unknown } | unknown;
        rawConfig = (mod as { default?: unknown }).default ?? mod;
    } catch {
        throw new Error(`Failed to load config: ${resolved}\n  Make sure the file exists and exports a valid config.`);
    }

    const result = SiteConfigSchema.safeParse(rawConfig);
    if (!result.success) {
        const issues = result.error.issues.map(i => `  • ${i.path.join(".") || "root"}: ${i.message}`).join("\n");
        throw new Error(`Invalid ai-docs.config.ts:\n${issues}`);
    }

    return result.data as SiteConfig;
}
