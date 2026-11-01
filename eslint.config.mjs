import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tsLint from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import vueLint from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  {
    ignores: [
      '**/coverage',
      '**/dist',
      '**/storybook',
      '**/node_modules',
      'public/new-relic.js',
      'tests/e2e/report/**',
      'tests/e2e/results/**'
    ]
  },
  js.configs.recommended,
  ...tsLint.configs['flat/recommended'].map(config =>
    config.name === 'typescript-eslint/eslint-recommended'
      ? { ...config, files: [...config.files, '**/*.vue'] }
      : config
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
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },

    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-throw-literal': 'error',

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
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
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
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],

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
      sourceType: 'script',
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
    files: ['**/tests/e2e/**/*.{js,cjs,jsx,ts,tsx}', 'scripts/**/*.mjs'],

    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
