// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const filesTS = ['**/*.ts', '**/*.tsx'];

export default [
  // Ignore junk + build output
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
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  {
    files: filesTS,
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      // lazy-import plugins so parsing stays fast
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
      'react-refresh': (await import('eslint-plugin-react-refresh')).default,
      import: (await import('eslint-plugin-import')).default,
    },
    settings: {
      // resolve @/* aliases via tsconfig paths
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      // React/Vite niceties
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Import hygiene
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'object',
            'type',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // TS ergonomics for your codebase
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
    },
  },
];
