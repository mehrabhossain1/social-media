import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.config({
        extends: ["next/core-web-vitals", "next/typescript"],
        rules: {
            "no-unused-expressions": "off", // Disable the base ESLint rule
            "@typescript-eslint/no-unused-expressions": "off", // Disable the TypeScript ESLint extension rule
        },
    }),
];

export default eslintConfig;
