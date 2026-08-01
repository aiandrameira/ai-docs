import { readFileSync } from "fs";
import { resolve } from "path";

interface PackageInfo {
    version: string;
}

const FALLBACK_PACKAGE_INFO: PackageInfo = { version: "0.0.0" };

export function loadPackageInfo(): PackageInfo {
    const candidates = [resolve(__dirname, "./package.json"), resolve(__dirname, "../../package.json")];

    for (const candidate of candidates) {
        try {
            return JSON.parse(readFileSync(candidate, "utf-8")) as PackageInfo;
        } catch {
            // Try the next location: bundled package first, monorepo source second.
        }
    }

    return FALLBACK_PACKAGE_INFO;
}
