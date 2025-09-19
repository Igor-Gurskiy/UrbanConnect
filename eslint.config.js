import storybook from "eslint-plugin-storybook";

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react';

export default tseslint.config(
  { ignores: ['dist'] }, 
  {
  extends: [
    js.configs.recommended, 
    ...tseslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
    react,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/display-name': 'off',
			'react/prop-types': 'off',

      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
  },
},
  eslintConfigPrettier, 
storybook.configs["flat/recommended"], storybook.configs["flat/recommended"], storybook.configs["flat/recommended"], storybook.configs["flat/recommended"]
);
