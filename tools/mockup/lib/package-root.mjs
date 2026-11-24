// This package's root directory; dependency-free so scripts can use it before an install.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
