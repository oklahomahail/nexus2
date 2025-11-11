// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import configPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default [
  // ---------- Global ignores ----------
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
      "MessagingAssistPanel_clean.tsx",
    ],
  },

  // ---------- Base JS config ----------
  js.configs.recommended,

  // ---------- App (TypeScript, browser) ----------
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
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
      // ---- Type-aware recommended baselines ----
      // Merge in TS ESLint's recommended type-checked + stylistic type-checked rules,
      // then override with our project-specific choices below.
      ...(tseslint.configs.recommendedTypeChecked?.rules ?? {}),
      ...(tseslint.configs.stylisticTypeChecked?.rules ?? {}),

      // React/Vite rules
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
      "import/no-unresolved": ["error", { caseSensitive: true }],

      // Unused cleanups (TS is the authority)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-imports": "error",

      // Prevent imports from removed directories (Q1 2025 cleanup)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/ui",
              message: "Use @/components/ui-kit instead. Duplicate UI library removed in Q1 2025 cleanup.",
            },
            {
              name: "@/features/writing",
              message: "Writing features are out of scope for Nexus. Nexus is a fundraising intelligence platform, not a writing tool.",
            },
            {
              name: "@/services/backup",
              message: "Backup services removed. Supabase is the source of truth. If offline support needed, re-add behind feature flag with E2EE.",
            },
            {
              name: "@/features/claude",
              message: "ClaudePanel removed. Use ai-privacy-gateway + CampaignDesignerWizard/DonorIntelligencePanel instead.",
            },
            {
              name: "@/features/tutorials",
              message: "Tutorial system removed. Will be re-added as Phase 2 onboarding checklist.",
            },
          ],
          patterns: [
            {
              group: ["**/components/ui/**"],
              message: "Use @/components/ui-kit instead.",
            },
            {
              group: ["**/features/writing/**"],
              message: "Writing features are out of scope.",
            },
            {
              group: ["**/services/backup/**"],
              message: "Backup services removed.",
            },
            {
              group: ["**/features/claude/**"],
              message: "ClaudePanel removed.",
            },
            {
              group: ["**/models/**", "**/viewModels/**"],
              message: "Use @/types/database.types.ts instead (generated from Supabase schema).",
            },
          ],
        },
      ],

      // Async safety
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          ignoreVoid: true, // allow: void someAsync()
          ignoreIIFE: true,
        },
      ],

      // Redundant in TS
      "no-undef": "off",

      // Prettier formatting
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
      // Unused cleanups (TS is the authority here too)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

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
      sourceType: "script",
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
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ---------- Disable rules that conflict with Prettier ----------
  configPrettier,
];
