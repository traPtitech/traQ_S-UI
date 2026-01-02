export function safeMod(x: number, r: number): number
export function safeMod(x: bigint, r: bigint): bigint

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeMod(x: any, r: any): any {
  return ((x % r) + r) % r
}
