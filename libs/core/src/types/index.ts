export interface FrontMatter {
    title?: string;
    description?: string;
    order?: number;
    sidebar?: boolean;
    toc?: boolean;
    breadcrumb?: boolean;
    draft?: boolean;
    tags?: string[];
    [key: string]: unknown;
}

export interface DocPage {
    slug: string;
    filePath: string;
    frontMatter: FrontMatter;
    content: string;
    rawContent: string;
}

export interface SidebarItem {
    title: string;
    href: string;
    order: number;
    active?: boolean;
    children?: SidebarItem[];
}

export interface TocItem {
    id: string;
    text: string;
    level: 2 | 3 | 4;
    children: TocItem[];
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface NavItem {
    label: string;
    href: string;
    external?: boolean;
}

export interface ThemeConfig {
    primaryColor?: string;
    accentColor?: string;
    codeTheme?: {
        light: string;
        dark: string;
    };
    customCss?: string;
}

export interface EditOnGitHub {
    repo: string;
    branch: string;
    docsDir: string;
}

export interface FeaturesConfig {
    search?: boolean;
    darkMode?: boolean;
    copyCode?: boolean;
    mermaid?: boolean;
    editOnGitHub?: EditOnGitHub;
}

export interface AiDocsPlugin {
    name: string;
    transform?: (page: DocPage) => DocPage | Promise<DocPage>;
    afterBuild?: (pages: DocPage[]) => void | Promise<void>;
}

export interface SiteConfig {
    title: string;
    description?: string;
    logo?: string;
    favicon?: string;
    github?: string;
    docs: string;
    output: string;
    base: string;
    nav?: NavItem[];
    theme?: ThemeConfig;
    features?: FeaturesConfig;
    plugins?: AiDocsPlugin[];
}

export interface PageContext {
    page: DocPage;
    sidebar: SidebarItem[];
    toc: TocItem[];
    breadcrumb: BreadcrumbItem[];
    prev?: SidebarItem;
    next?: SidebarItem;
    config: SiteConfig;
}

export function defineConfig(config: SiteConfig): SiteConfig {
    return {
        ...config,
        features: {
            search: true,
            darkMode: true,
            copyCode: true,
            mermaid: false,
            ...config.features,
        },
    };
}
