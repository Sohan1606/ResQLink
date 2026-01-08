import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react'; // ✅ Added full React support
import prettier from 'eslint-plugin-prettier'; // ✅ Prettier integration
import importOrder from 'eslint-plugin-simple-import-sort'; // ✅ Import sorting
import sonarjs from 'eslint-plugin-sonarjs'; // ✅ Code quality
import promise from 'eslint-plugin-promise'; // ✅ Promise handling
import unicorn from 'eslint-plugin-unicorn'; // ✅ Modern JS best practices
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // 🚀 Global ignores
  globalIgnores(['dist/**', 'node_modules/**', '*.config.{js,ts}', 'public/**']),
  
  // 🌐 Main config for all JS/JSX/TS/TSX files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      'eslint:recommended',
      react.configs.recommended,
      react.configs['jsx-runtime'], // ✅ Modern JSX transform
      reactHooks.configs.recommended,
      reactRefresh.configs.vite,
      'plugin:prettier/recommended', // ✅ Prettier last
      'plugin:sonarjs/recommended',
      'plugin:promise/recommended',
    ],
    
    // 🔧 Language options - ES2022+ with modern features
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node, // ✅ Node.js globals for Vite
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },

    // 🛡️ Strict production rules
    plugins: {
      react,
      prettier,
      'simple-import-sort': importOrder,
      promise,
      sonarjs,
      unicorn,
    },

    // 🎯 Rules - Production optimized
    rules: {
      // 🔒 Security & Quality
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/cognitive-complexity': ['error', 15],
      'promise/prefer-await-to-then': 'error',
      
      // ⚛️ React best practices
      'react/react-in-jsx-scope': 'off', // ✅ Removed - automatic JSX runtime
      'react/jsx-uses-react': 'off', // ✅ Removed - automatic JSX runtime
      'react/prop-types': 'off', // ✅ TypeScript handles this
      'react/no-unescaped-entities': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      
      // 📦 Import organization
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^ignore',
        },
      ],
      
      // 🦄 Modern JS
      'unicorn/prefer-dom-node-text-content': 'error',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/no-null': 'warn',
      
      // 🎨 Formatting (Prettier handles most)
      'prettier/prettier': 'error',
      
      // ✅ Common fixes for React/Vite
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 🚫 Disable problematic rules
      'react/no-unknown-property': [
        'error',
        { ignore: ['css', 'data-testid', 'data-'] },
      ],
    },

    // 📱 Settings for React 18+ and Vite
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {}, // ✅ TS path resolution
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },

  // 🔍 Test files config
  {
    files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },

  // 📄 Storybook files
  {
    files: ['**/*.stories.{js,jsx,ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      'react/prop-types': 'off',
    },
  },
]);
