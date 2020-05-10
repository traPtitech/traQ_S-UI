declare interface Navigator {
  setAppBadge(n: number): Promise<void>
  clearAppBadge(): Promise<void>
}
