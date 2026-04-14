import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
    {
        ignores: [
            '**/node_modules/**',
            '**/public/**',
            '**/build/**',
            'src/external/**',
            '**/*.d.ts',
            'src/frontend/config/env.js',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                __BROWSER__: 'readonly',
                __SERVER__: 'readonly',
            },
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: {
                    paths: [path.join(__dirname, 'src')],
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'import/no-unassigned-import': 'off',
            'import/no-named-as-default-member': 'off',
            curly: ['error', 'multi'],
        },
    },
)
