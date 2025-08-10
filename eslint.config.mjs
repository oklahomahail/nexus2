// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import configPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

// If you use top-level await (Node 18+), this file is fine as .mjs

export default [
  // Global ignores
  {
    ignores: [
      "dist",
      "node_modules",
      "coverage",
      "*.log",
      "*.tmp",
      ".vercel",
      ".vscode",
      "pnpm-lock.yaml",
      "src/deprecated/**",
      "backend/**",
      "scripts/**",
      "eslint.config.mjs",
      "careful.prop.fixes.js",
      "diagnose_files.js",
      "fix-all-props.js",
      "fix_import_errors.js",
      "fix_remaining_errors.js",
      "fix_syntax_errors.js",
      "precise_fix.js",
      // stray scratch files
      "MessagingAssistPanel_clean.tsx",
    ],
  },

  // Base JS (applies to any .js not ignored)
  js.configs.recommended,

  // ---------- App (TypeScript, browser) ----------
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"], // enable type-aware rules
        tsconfigRootDir: process.cwd(),
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        fetch: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      "react-hooks": (await import("eslint-plugin-react-hooks")).default,
      "react-refresh": (await import("eslint-plugin-react-refresh")).default,
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
      prettier: (await import("eslint-plugin-prettier")).default,
    },
    settings: {
      // Fix "Resolve error: typescript with invalid interface loaded as resolver"
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: true,
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
    },
    rules: {
      // React/Vite niceties
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Import hygiene & order
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "before" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import/no-unresolved": "off", // handled by TS + resolver above

      // Unused cleanups
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Async safety
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/await-thenable": "warn",

      // TS already handles undefined vars in TS files
      "no-undef": "off",

      // Prettier via ESLint
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },

  // ---------- Node TS (e.g., vite.config.ts) ----------
  {
    files: ["vite.config.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
      },
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      prettier: (await import("eslint-plugin-prettier")).default,
    },
    rules: {
      "no-undef": "off",
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },

  // ---------- Node JS scripts / backend ----------
  {
    files: [
      "backend/**/*.{js,cjs,mjs}",
      "scripts/**/*.{js,mjs}",
      "validate-migration.js",
      "generate-nexus-starter.js",
      "tailwind.config.js",
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // many use require()
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
      },
    },
    plugins: {
      prettier: (await import("eslint-plugin-prettier")).default,
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },

  // Last: disable rules that conflict with Prettier
  configPrettier,
];
