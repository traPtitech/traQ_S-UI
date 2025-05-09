/* eslint-disable @typescript-eslint/consistent-type-imports */
/**
 * volar global components
 * @see https://github.com/johnsoncodehk/volar/blob/37deac779c407d5de16275fd7f341d1e11b6ad60/extensions/vscode-vue-language-features/README.md#usage
 */

declare module 'vue' {
  export interface GlobalComponents {
    RouterLink: (typeof import('vue-router'))['RouterLink']
    RouterView: (typeof import('vue-router'))['RouterView']
  }
}

export {}
