import 'vitest'

interface CustomMatchers {
  /**
   * 順番を無視して配列の内容が一致するかチェックする
   */
  toStrictEqualArrayIgnoringOrder(expected: unknown[]): void
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  interface Assertion extends CustomMatchers {}
}

expect.extend({
  toStrictEqualArrayIgnoringOrder(received, expected) {
    if (!Array.isArray(received) || !Array.isArray(expected)) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} to be array.`,
        pass: false
      }
    }
    if (received.length !== expected.length) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} to be same length with ${this.utils.printExpected(expected)}.`,
        pass: false
      }
    }

    const alreadyUsedIndex = new Set()
    for (const r of received) {
      let i = -1
      while (i === -1) {
        i = expected.findIndex(e => this.equals(e, r, undefined, true))
        if (!alreadyUsedIndex.has(i)) break
      }
      if (i === -1) {
        return {
          message: () =>
            `expected ${this.utils.printReceived(
              r
            )} to exist in ${this.utils.printExpected(expected)}.`,
          pass: false
        }
      }
      alreadyUsedIndex.add(i)
    }

    return {
      message: () =>
        `expected ${this.utils.printReceived(
          received
        )} to be same with ${this.utils.printExpected(
          expected
        )} ignoring order.`,
      pass: true
    }
  }
})

export {}
