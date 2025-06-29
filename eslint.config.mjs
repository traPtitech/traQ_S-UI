import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import stylistic from '@stylistic/eslint-plugin'
import cypress from 'eslint-plugin-cypress'
import vueLint from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  {
    ignores: [
      '**/coverage',
      '**/dist',
      '**/node_modules',
      'public/new-relic.js'
    ]
  },
  ...compat.extends(
    'eslint:recommended',
    './eslint-vue-ts-recommended.cjs',
    'plugin:@typescript-eslint/recommended'
  ),
  ...vueLint.configs['flat/recommended'],
  prettier,
  {
    plugins: {
      'unused-imports': unusedImports,
      '@stylistic/ts': stylistic
    },

    linterOptions: {
      reportUnusedDisableDirectives: true
    },

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },

    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',

      'no-empty': [
        'error',
        {
          allowEmptyCatch: true
        }
      ],

      eqeqeq: 'error',
      'vue/eqeqeq': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      '@stylistic/ts/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'none'
          },

          singleline: {
            delimiter: 'semi'
          }
        }
      ],

      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-v-html': 'off',

      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts'
          },

          style: {
            lang: 'scss'
          }
        }
      ],

      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],

      'vue/v-on-event-hyphenation': [
        'error',
        'always',
        {
          autofix: true
        }
      ],

      'vue/no-template-target-blank': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error'
    }
  },
  {
    files: ['**/*.cjs'],
    ignores: ['*/**/*.cjs'],

    languageOptions: {
      globals: {
        ...globals.node
      }
    },

    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    files: ['**/public/**/*.js', '**/build/**/*.js'],
    rules: {
      'no-undef': 'off'
    }
  },
  {
    plugins: { cypress },
    files: ['**/tests/e2e/**/*.{js,cjs,jsx,ts,tsx}'],
    rules: { ...cypress.configs.recommended.rules }
  },
  {
    files: ['**/tests/e2e/**/*.{js,cjs,jsx,ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
