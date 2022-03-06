/**
 * Badging API
 * @see https://github.com/w3c/badging/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Badging_API
 */

declare interface Navigator {
  setAppBadge(n: number): Promise<void>
  clearAppBadge(): Promise<void>
}
