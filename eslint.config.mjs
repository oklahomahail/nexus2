// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import configPrettier from 'eslint-config-prettier';

export default [
  // Ignore stuff we don't want to lint at all
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      '*.log',
      '*.tmp',
      '.vercel',
      '.vscode',
      'pnpm-lock.yaml',
      'src/deprecated/**', // <- avoids typed-linting project mismatch
      'backend/**',        // backend uses Node/require; handled below as JS
      'scripts/**',
      'eslint.config.mjs',
    ],
  },

  // Base JS rules for any .js/.mjs/.cjs that aren't in the ignores
  js.configs.recommended,

  // ----- Typed TypeScript for your app (browser) -----
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
      'react-refresh': (await import('eslint-plugin-react-refresh')).default,
      import: (await import('eslint-plugin-import')).default,
      'unused-imports': (await import('eslint-plugin-unused-imports')).default,
      prettier: (await import('eslint-plugin-prettier')).default,
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      // React/Vite niceties
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import order
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // Unused cleanups
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Async safety
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',

      // TS already handles undefined vars better than ESLint in TS files
      'no-undef': 'off',

      // Run Prettier via ESLint
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ----- Node TS config files (e.g., vite.config.ts) -----
  {
    files: ['vite.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin, prettier: (await import('eslint-plugin-prettier')).default },
    rules: {
      'no-undef': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },

  // ----- Node JS scripts & backend (CJS/MJS/JS) -----
  {
    files: [
      'backend/**/*.{js,cjs,mjs}',
      'scripts/**/*.{js,mjs}',
      'validate-migration.js',
      'generate-nexus-starter.js',
      'tailwind.config.js',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script', // many of these use require()
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly', // Node 18+ has global fetch
        setTimeout: 'readonly',
      },
    },
    plugins: {
      prettier: (await import('eslint-plugin-prettier')).default,
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // MUST be last: turn off rules that conflict with Prettier
  configPrettier,
];
