import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/vendor/**',
      '**/dist/**',
      '**/build/**',
      '**/.output/**',
      '**/backend/**',
      '**/public/**',
      '**/coverage/**',
      '**/dev-dist/**',
      '**/cypress/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    rules: {
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-slot-attribute': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.spec.{ts,js}', '**/*.test.{ts,js}'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-conditional-expect': 'error',
      'vitest/no-conditional-in-test': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-standalone-expect': 'error',
      'vitest/no-disabled-tests': 'warn',
    },
  },
  prettierConfig,
];
