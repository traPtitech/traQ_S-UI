import { safeMod } from '/@/lib/basic/arithmetic'

describe('safeMod', () => {
  describe('number', () => {
    describe('positive dividend', () => {
      it('can calculate basic mod', () => {
        expect(safeMod(7, 3)).toBe(1)
      })
      it('can calculate when dividend is less than divisor', () => {
        expect(safeMod(2, 5)).toBe(2)
      })
      it('can calculate when dividend equals divisor', () => {
        expect(safeMod(5, 5)).toBe(0)
      })
      it('can calculate when dividend is multiple of divisor', () => {
        expect(safeMod(10, 5)).toBe(0)
      })
      it('can calculate with large numbers', () => {
        expect(safeMod(1000000007, 1000000)).toBe(7)
      })
    })

    describe('zero dividend', () => {
      it('returns zero', () => {
        expect(safeMod(0, 5)).toBe(0)
      })
      it('returns zero for any positive divisor', () => {
        expect(safeMod(0, 1)).toBe(0)
        expect(safeMod(0, 100)).toBe(0)
      })
    })

    describe('negative dividend', () => {
      it('can calculate simple negative mod', () => {
        expect(safeMod(-1, 5)).toBe(4)
      })
      it('can calculate negative mod with larger absolute value', () => {
        expect(safeMod(-7, 3)).toBe(2)
      })
      it('can calculate when absolute value equals divisor', () => {
        expect(safeMod(-5, 5)).toBe(0)
      })
      it('can calculate when absolute value is multiple of divisor', () => {
        expect(safeMod(-10, 5)).toBe(0)
      })
      it('can calculate with various negative values', () => {
        expect(safeMod(-2, 5)).toBe(3)
        expect(safeMod(-3, 5)).toBe(2)
        expect(safeMod(-4, 5)).toBe(1)
      })
    })

    describe('decimal numbers', () => {
      it('can handle decimal dividend', () => {
        expect(safeMod(7.5, 3)).toBeCloseTo(1.5)
      })
      it('can handle negative decimal dividend', () => {
        expect(safeMod(-1.5, 5)).toBeCloseTo(3.5)
      })
    })
  })

  describe('bigint', () => {
    describe('positive dividend', () => {
      it('can calculate basic mod', () => {
        expect(safeMod(7n, 3n)).toBe(1n)
      })
      it('can calculate when dividend is less than divisor', () => {
        expect(safeMod(2n, 5n)).toBe(2n)
      })
      it('can calculate when dividend equals divisor', () => {
        expect(safeMod(5n, 5n)).toBe(0n)
      })
      it('can calculate with very large numbers', () => {
        expect(safeMod(10000000000000000007n, 1000000000000000000n)).toBe(7n)
      })
    })

    describe('zero dividend', () => {
      it('returns zero', () => {
        expect(safeMod(0n, 5n)).toBe(0n)
      })
    })

    describe('negative dividend', () => {
      it('can calculate simple negative mod', () => {
        expect(safeMod(-1n, 5n)).toBe(4n)
      })
      it('can calculate negative mod with larger absolute value', () => {
        expect(safeMod(-7n, 3n)).toBe(2n)
      })
      it('can calculate when absolute value equals divisor', () => {
        expect(safeMod(-5n, 5n)).toBe(0n)
      })
      it('can calculate with various negative values', () => {
        expect(safeMod(-2n, 5n)).toBe(3n)
        expect(safeMod(-3n, 5n)).toBe(2n)
        expect(safeMod(-4n, 5n)).toBe(1n)
      })
      it('can handle very large negative numbers', () => {
        expect(safeMod(-10000000000000000007n, 1000000000000000000n)).toBe(
          999999999999999993n
        )
      })
    })
  })
})
