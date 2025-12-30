import flushableDebounce from '/@/lib/flushableDebounce'

describe('flushableDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('basic behavior', () => {
    describe('register', () => {
      it('should debounce the callback', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('arg1')
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(50)
        debounced('arg2')
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(100)
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('arg2')
      })

      it('should call callback after specified delay', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(99)
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('test')
      })

      it('should pass multiple arguments to callback', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('arg1', 'arg2', 'arg3')
        vi.advanceTimersByTime(100)

        expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
      })

      it('should work with zero delay', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(0, callback)

        debounced('immediate')
        vi.advanceTimersByTime(0)

        expect(callback).toHaveBeenCalledWith('immediate')
      })

      it('should clear pendingParams after natural execution', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        vi.advanceTimersByTime(100)
        expect(callback).toHaveBeenCalledTimes(1)

        debounced.flush()
        expect(callback).toHaveBeenCalledTimes(1)
      })
    })

    describe('flush', () => {
      it('should immediately call pending callback', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('immediate')
        expect(callback).not.toHaveBeenCalled()

        debounced.flush()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('immediate')
      })

      it('should not call callback if nothing is pending', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced.flush()
        expect(callback).not.toHaveBeenCalled()
      })

      it('should cancel the original debounce timer after flush', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.flush()
        expect(callback).toHaveBeenCalledTimes(1)

        // Should not be called again after time passes
        vi.advanceTimersByTime(100)
        expect(callback).toHaveBeenCalledTimes(1)
      })

      it('should flush with the latest arguments', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('first')
        debounced('second')
        debounced('third')
        debounced.flush()

        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('third')
      })

      it('should clear pendingParams after flush', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.flush()
        debounced.flush()

        expect(callback).toHaveBeenCalledTimes(1)
      })

      it('should work mid-delay', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        vi.advanceTimersByTime(50)

        debounced.flush()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('test')

        vi.advanceTimersByTime(50)
        expect(callback).toHaveBeenCalledTimes(1)
      })

      it('should preserve argument references when flushing', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)
        const obj = { mutable: true }

        debounced(obj)
        obj.mutable = false
        debounced.flush()

        expect(callback).toHaveBeenCalledWith({ mutable: false })
      })

      it('should allow registering new debounce after flush', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('first')
        debounced.flush()
        expect(callback).toHaveBeenCalledWith('first')

        debounced('second')
        debounced.flush()
        expect(callback).toHaveBeenCalledWith('second')

        expect(callback).toHaveBeenCalledTimes(2)
      })
    })

    describe('cancel', () => {
      it('should cancel pending callback', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.cancel()

        vi.advanceTimersByTime(100)
        expect(callback).not.toHaveBeenCalled()
      })

      it('should clear pendingParams on cancel', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.cancel()
        debounced.flush()

        expect(callback).not.toHaveBeenCalled()
      })

      it('should allow registering new debounce after cancel', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('first')
        debounced.cancel()

        debounced('second')
        vi.advanceTimersByTime(100)

        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('second')
      })

      it('should be safe to call multiple times', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.cancel()
        debounced.cancel()
        debounced.cancel()

        vi.advanceTimersByTime(100)
        expect(callback).not.toHaveBeenCalled()
      })

      it('should be safe to call when nothing is pending', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        expect(() => debounced.cancel()).not.toThrow()
        expect(callback).not.toHaveBeenCalled()
      })

      it('should cancel mid-delay', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        vi.advanceTimersByTime(50)
        debounced.cancel()

        vi.advanceTimersByTime(100)
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })

  describe('options', () => {
    describe('atBegin', () => {
      it('should execute immediately with atBegin option', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback, { atBegin: true })

        debounced('test')
        expect(callback).toHaveBeenCalledWith('test')
        expect(callback).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(100)
        expect(callback).toHaveBeenCalledTimes(1)
      })

      it('should allow re-execution after cooldown with atBegin option', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback, { atBegin: true })

        debounced('first')
        expect(callback).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(100)
        debounced('second')
        expect(callback).toHaveBeenCalledTimes(2)
      })
    })

    describe('upcomingOnly', () => {
      it('should cancel with upcomingOnly: false', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.cancel({ upcomingOnly: false })

        vi.advanceTimersByTime(100)
        expect(callback).not.toHaveBeenCalled()

        // pendingParams should also be cleared
        debounced.flush()
        expect(callback).not.toHaveBeenCalled()
      })

      it('should cancel with explicit upcomingOnly: true', () => {
        const callback = vi.fn()
        const debounced = flushableDebounce(100, callback)

        debounced('test')
        debounced.cancel({ upcomingOnly: true })

        vi.advanceTimersByTime(100)
        expect(callback).not.toHaveBeenCalled()

        // pendingParams should also be cleared
        debounced.flush()
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })

  describe('argument types', () => {
    it('should handle object arguments', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)
      const obj = { key: 'value', nested: { data: 123 } }

      debounced(obj)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith(obj)
    })

    it('should handle undefined and null', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced(undefined, null)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith(undefined, null)
    })

    it('should handle falsy values (0, empty string, false)', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced(0, '', false)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith(0, '', false)
    })

    it('should flush with argument 0', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced(0)
      debounced.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(0)
    })

    it('should flush with empty string', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced('')
      debounced.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('')
    })

    it('should flush with false', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced(false)
      debounced.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(false)
    })

    it('should handle function arguments', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)
      const fn = () => 'result'

      debounced(fn)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith(fn)
    })

    it('should handle array arguments', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)
      const arr = [1, 2, 3]

      debounced(arr)
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith(arr)
    })

    it('should handle no arguments', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced()
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith()
    })
  })

  describe('combined operations', () => {
    it('should handle mixed flush and normal completion', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced('first')
      debounced.flush()

      debounced('second')
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenNthCalledWith(1, 'first')
      expect(callback).toHaveBeenNthCalledWith(2, 'second')
    })

    it('should handle register → cancel → register → flush sequence', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced('first')
      debounced.cancel()

      debounced('second')
      debounced.flush()

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('second')
    })

    /**
     * Complex operation sequence test:
     * 1. Register a, b, c consecutively → cancel all
     * 2. Register d → execute after delay
     * 3. Register e → execute immediately with flush
     */
    it('should handle complex operation sequence', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      // Register a, b, c consecutively (only c is pending due to debounce)
      debounced('a')
      vi.advanceTimersByTime(50)
      debounced('b')
      vi.advanceTimersByTime(50)
      debounced('c')
      // Cancel pending c
      debounced.cancel()

      // Register d and execute after delay
      debounced('d')
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('d')

      // Register e and execute immediately with flush
      debounced('e')
      debounced.flush()

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenNthCalledWith(2, 'e')
    })

    it('should handle interleaved register and time advancement', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      debounced('a')
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledWith('a')

      debounced('b')
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledWith('b')

      debounced('c')
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledWith('c')

      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid consecutive calls', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(100, callback)

      for (let i = 0; i < 10; i++) {
        debounced(`call-${i}`)
        vi.advanceTimersByTime(10)
      }

      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('call-9')
    })
  })

  describe('edge cases', () => {
    it('should handle very long delay', () => {
      const callback = vi.fn()
      const debounced = flushableDebounce(10000, callback)

      debounced('long-delay')
      vi.advanceTimersByTime(9999)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledWith('long-delay')
    })

    it('should handle callback that throws', () => {
      const callback = vi.fn(() => {
        throw new Error('callback error')
      })
      const debounced = flushableDebounce(100, callback)

      debounced()
      expect(() => debounced.flush()).toThrow('callback error')
    })

    /**
     * Verify that different instances maintain independent state:
     * - Canceling debounced1 does not affect debounced2
     */
    it('should maintain separate state for different instances', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      const debounced1 = flushableDebounce(100, callback1)
      const debounced2 = flushableDebounce(100, callback2)

      debounced1('instance1')
      debounced2('instance2')

      // Only cancel debounced1
      debounced1.cancel()

      vi.advanceTimersByTime(100)

      // debounced1 was canceled, so not called
      expect(callback1).not.toHaveBeenCalled()
      // debounced2 is unaffected and executes normally
      expect(callback2).toHaveBeenCalledWith('instance2')
    })

    it('should work with async callbacks', async () => {
      const results: string[] = []
      const callback = vi.fn(async (value: string) => {
        results.push(value)
      })
      const debounced = flushableDebounce(100, callback)

      debounced('async-test')
      vi.advanceTimersByTime(100)

      expect(callback).toHaveBeenCalledWith('async-test')
    })
  })
})
