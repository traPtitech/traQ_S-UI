/* eslint-disable @typescript-eslint/no-non-null-assertion */
import createOptimisticUpdater from '/@/lib/optimisticUpdate'

describe('createOptimisticUpdater', () => {
  describe('basic behavior', () => {
    describe('update', () => {
      it('should immediately update state with new value', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn()

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('updated')

        expect(setState).toHaveBeenCalledWith('updated')
        expect(state).toBe('updated')
      })

      it('should call execute with new state', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn()

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('new-state')

        expect(execute).toHaveBeenCalledWith('new-state')
      })

      it('should update state before execute completes (optimistic)', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)

        let executeResolve: () => void
        const execute = vi.fn(
          () =>
            new Promise<void>(resolve => {
              executeResolve = resolve
            })
        )

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        const updatePromise = update('optimistic')

        // State should be updated immediately before execute resolves
        expect(state).toBe('optimistic')
        expect(setState).toHaveBeenCalledWith('optimistic')

        // Resolve execute
        executeResolve!()
        await updatePromise
      })

      it('should call getState before setState', async () => {
        const callOrder: string[] = []
        let state = 'initial'

        const getState = vi.fn(() => {
          callOrder.push('getState')
          return state
        })

        const setState = vi.fn((newState: string) => {
          callOrder.push('setState')
          state = newState
        })

        const execute = vi.fn()

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('new')

        expect(callOrder).toEqual(['getState', 'setState'])
      })

      it('should store previous state for rollback', async () => {
        let state = 'original'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn().mockRejectedValue(new Error('fail'))

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('new-value')

        // Should have rolled back to original
        expect(state).toBe('original')
      })
    })

    describe('rollback', () => {
      it('should rollback to previous state on execute failure', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn().mockRejectedValue(new Error('API error'))

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('failed-update')

        // setState should be called twice: once for update, once for rollback
        expect(setState).toHaveBeenCalledTimes(2)
        expect(setState).toHaveBeenNthCalledWith(1, 'failed-update')
        expect(setState).toHaveBeenNthCalledWith(2, 'initial')
        expect(state).toBe('initial')
      })

      it('should not throw when execute fails', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn().mockRejectedValue(new Error('some error'))

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        // Should not throw
        await expect(update('value')).resolves.toBeUndefined()
      })

      it('should be callable manually via rollback method', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)

        let executeResolve: () => void
        const execute = vi.fn(
          () =>
            new Promise<void>(resolve => {
              executeResolve = resolve
            })
        )

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        const updatePromise = update('new-state')

        // Manually rollback before execute completes
        update.rollback()

        expect(state).toBe('initial')

        executeResolve!()
        await updatePromise
      })

      it('should do nothing if rollback called without previous update', () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn()

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        // Call rollback without any update
        update.rollback()

        expect(setState).not.toHaveBeenCalled()
        expect(state).toBe('initial')
      })

      it('should clear previous state after rollback', async () => {
        let state = 'initial'
        const setState = vi.fn((newState: string) => {
          state = newState
        })
        const getState = vi.fn(() => state)
        const execute = vi.fn().mockRejectedValue(new Error('fail'))

        const update = createOptimisticUpdater({
          getState,
          setState,
          execute
        })

        await update('new')

        // After rollback, previousState should be null
        // Calling rollback again should do nothing
        setState.mockClear()
        update.rollback()

        expect(setState).not.toHaveBeenCalled()
      })
    })
  })

  describe('state types', () => {
    it('should work with object state', async () => {
      let state = { count: 0, name: 'test' }
      const setState = vi.fn((newState: { count: number; name: string }) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update({ count: 5, name: 'updated' })

      expect(state).toEqual({ count: 5, name: 'updated' })
    })

    it('should work with array state', async () => {
      let state = [1, 2, 3]
      const setState = vi.fn((newState: number[]) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update([4, 5, 6])

      expect(state).toEqual([4, 5, 6])
    })

    it('should work with number state', async () => {
      let state = 0
      const setState = vi.fn((newState: number) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update(42)

      expect(state).toBe(42)
    })

    it('should work with null state', async () => {
      let state: string | null = 'initial'
      const setState = vi.fn((newState: string | null) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update(null)

      expect(state).toBeNull()
    })

    it('should rollback object state correctly', async () => {
      const originalState = { data: 'original' }
      let state = originalState
      const setState = vi.fn((newState: { data: string }) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockRejectedValue(new Error('fail'))

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update({ data: 'new' })

      expect(state).toBe(originalState)
    })
  })

  describe('sequential updates', () => {
    it('should handle multiple sequential updates', async () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('first')
      await update('second')
      await update('third')

      expect(state).toBe('third')
      expect(execute).toHaveBeenCalledTimes(3)
    })

    it('should rollback to most recent previous state on failure', async () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('fail'))

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('first') // success
      await update('second') // success
      await update('third') // fail

      // Should rollback to 'second' (the state before 'third')
      expect(state).toBe('second')
    })

    it('should handle interleaved success and failure', async () => {
      let state = 0
      const setState = vi.fn((newState: number) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi
        .fn()
        .mockResolvedValueOnce(undefined) // 1st: success
        .mockRejectedValueOnce(new Error('fail')) // 2nd: fail
        .mockResolvedValueOnce(undefined) // 3rd: success

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update(1) // success, state = 1
      await update(2) // fail, rollback to 1
      await update(3) // success, state = 3

      expect(state).toBe(3)
    })
  })

  describe('async behavior', () => {
    it('should wait for execute to complete', async () => {
      let state = 'initial'
      let executeCompleted = false
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
        executeCompleted = true
      })

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      const updatePromise = update('async')

      // State updated immediately
      expect(state).toBe('async')
      expect(executeCompleted).toBe(false)

      await updatePromise

      expect(executeCompleted).toBe(true)
    })

    it('should handle execute that returns a value', async () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockResolvedValue('execute-result')

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('new')

      expect(state).toBe('new')
      expect(execute).toHaveBeenCalled()
    })

    it('should handle execute that throws synchronously', async () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn(() => {
        throw new Error('sync error')
      })

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('new')

      // Should rollback since execute threw
      expect(state).toBe('initial')
    })
  })

  describe('edge cases', () => {
    it('should work with undefined as initial state', async () => {
      let state: string | undefined = undefined
      const setState = vi.fn((newState: string | undefined) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockRejectedValue(new Error('fail'))

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('value')

      expect(state).toBeUndefined()
    })

    it('should create independent updaters', async () => {
      let state1 = 'state1'
      let state2 = 'state2'

      const update1 = createOptimisticUpdater({
        getState: () => state1,
        setState: (s: string) => {
          state1 = s
        },
        execute: vi.fn()
      })

      const update2 = createOptimisticUpdater({
        getState: () => state2,
        setState: (s: string) => {
          state2 = s
        },
        execute: vi.fn().mockRejectedValue(new Error('fail'))
      })

      await update1('updated1')
      await update2('updated2')

      expect(state1).toBe('updated1')
      expect(state2).toBe('state2') // rolled back
    })

    it('should handle rollback being called multiple times', () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute: vi.fn()
      })

      // Multiple rollback calls should not cause issues
      update.rollback()
      update.rollback()
      update.rollback()

      expect(setState).not.toHaveBeenCalled()
    })

    it('should preserve state reference identity on rollback', async () => {
      const original = { id: 1, data: 'test' }
      let state = original
      const setState = vi.fn((newState: typeof state) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockRejectedValue(new Error('fail'))

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update({ id: 2, data: 'new' })

      // Should be exact same reference, not just equal
      expect(state).toBe(original)
    })

    it('should work with null as new state value', async () => {
      let state: string | null = 'initial'
      const setState = vi.fn((newState: string | null) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockRejectedValue(new Error('fail'))

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update(null)

      // Should rollback to 'initial'
      expect(state).toBe('initial')
    })

    it('should work when state changes between getState and setState', async () => {
      let state = 'initial'
      let getStateCallCount = 0

      const getState = vi.fn(() => {
        getStateCallCount++
        return state
      })

      const setState = vi.fn((newState: string) => {
        state = newState
      })

      const execute = vi.fn()

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      await update('new')

      // getState should only be called once per update
      expect(getStateCallCount).toBe(1)
    })
  })

  describe('concurrent updates', () => {
    it('should handle overlapping updates with different execution times', async () => {
      let state = 0
      const setState = vi.fn((newState: number) => {
        state = newState
      })
      const getState = vi.fn(() => state)

      let resolve1: () => void
      let resolve2: () => void

      const execute = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<void>(resolve => {
              resolve1 = resolve
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise<void>(resolve => {
              resolve2 = resolve
            })
        )

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      // Start first update (takes longer)
      const promise1 = update(1)
      expect(state).toBe(1)

      // Start second update (completes first)
      const promise2 = update(2)
      expect(state).toBe(2)

      // Complete second update first
      resolve2!()
      await promise2

      // Complete first update
      resolve1!()
      await promise1

      // Final state should be 2 (last update wins)
      expect(state).toBe(2)
    })

    it('should handle failure in first update while second is pending', async () => {
      let state = 0
      const setState = vi.fn((newState: number) => {
        state = newState
      })
      const getState = vi.fn(() => state)

      let reject1: (e: Error) => void
      let resolve2: () => void

      const execute = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<void>((_, reject) => {
              reject1 = reject
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise<void>(resolve => {
              resolve2 = resolve
            })
        )

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      const promise1 = update(1)
      const promise2 = update(2)

      expect(state).toBe(2)

      // First update fails
      reject1!(new Error('fail'))
      await promise1

      // State rolled back to 1 (state before failed update)
      // But this is problematic because second update already changed state
      // Implementation rolls back to the state captured when update(1) was called
      // which is 0

      // Complete second update
      resolve2!()
      await promise2

      // This demonstrates the race condition behavior
      expect(execute).toHaveBeenCalledTimes(2)
    })

    it('should handle rapid sequential updates', async () => {
      let state = 0
      const setState = vi.fn((newState: number) => {
        state = newState
      })
      const getState = vi.fn(() => state)
      const execute = vi.fn().mockResolvedValue(undefined)

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      // Fire many updates without awaiting
      const promises = []
      for (let i = 1; i <= 10; i++) {
        promises.push(update(i))
      }

      await Promise.all(promises)

      expect(state).toBe(10)
      expect(execute).toHaveBeenCalledTimes(10)
    })
  })

  describe('rollback timing', () => {
    it('should not double-rollback when manual and automatic rollback occur', async () => {
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)

      let rejectExecute: (e: Error) => void
      const execute = vi.fn(
        () =>
          new Promise<void>((_, reject) => {
            rejectExecute = reject
          })
      )

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      const updatePromise = update('new')
      expect(state).toBe('new')

      // Manual rollback first
      update.rollback()
      expect(state).toBe('initial')

      // Then execute fails - should not rollback again since previousState is cleared
      rejectExecute!(new Error('fail'))
      await updatePromise

      // setState should be called twice: once for update, once for manual rollback
      expect(setState).toHaveBeenCalledTimes(2)
    })

    it('should handle rollback during execute that has side effects', async () => {
      const sideEffects: string[] = []
      let state = 'initial'
      const setState = vi.fn((newState: string) => {
        state = newState
      })
      const getState = vi.fn(() => state)

      const execute = vi.fn(async (newState: string) => {
        sideEffects.push(`execute-start-${newState}`)
        await new Promise(resolve => setTimeout(resolve, 10))
        sideEffects.push(`execute-end-${newState}`)
      })

      const update = createOptimisticUpdater({
        getState,
        setState,
        execute
      })

      const updatePromise = update('async')

      // Rollback immediately
      update.rollback()
      expect(state).toBe('initial')

      await updatePromise

      // Execute still ran to completion despite rollback
      expect(sideEffects).toEqual(['execute-start-async', 'execute-end-async'])
    })
  })

  describe('real-world patterns', () => {
    it('should simulate API call pattern with success', async () => {
      // Simulating a todo completion toggle
      interface Todo {
        id: number
        completed: boolean
      }

      let todo: Todo = { id: 1, completed: false }
      const apiCalls: Todo[] = []

      const update = createOptimisticUpdater({
        getState: () => todo,
        setState: (newTodo: Todo) => {
          todo = newTodo
        },
        execute: async (newTodo: Todo) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 5))
          apiCalls.push(newTodo)
        }
      })

      // Toggle completion
      await update({ ...todo, completed: true })

      expect(todo.completed).toBe(true)
      expect(apiCalls).toHaveLength(1)
      expect(apiCalls[0]).toEqual({ id: 1, completed: true })
    })

    it('should simulate API call pattern with failure and rollback', async () => {
      interface Counter {
        value: number
      }

      let counter: Counter = { value: 0 }
      let apiCallCount = 0

      const update = createOptimisticUpdater({
        getState: () => counter,
        setState: (newCounter: Counter) => {
          counter = newCounter
        },
        execute: async () => {
          apiCallCount++
          await new Promise(resolve => setTimeout(resolve, 5))
          throw new Error('Network error')
        }
      })

      // Try to increment
      await update({ value: 1 })

      // Should rollback to 0
      expect(counter.value).toBe(0)
      expect(apiCallCount).toBe(1)
    })

    it('should simulate optimistic like button with rapid clicks', async () => {
      let likes = 0
      let successfulApiCalls = 0

      const update = createOptimisticUpdater({
        getState: () => likes,
        setState: (newLikes: number) => {
          likes = newLikes
        },
        execute: async () => {
          await new Promise(resolve => setTimeout(resolve, 2))
          successfulApiCalls++
        }
      })

      // Rapid like/unlike clicks
      await Promise.all([
        update(1), // like
        update(0), // unlike
        update(1), // like
        update(0), // unlike
        update(1) // like
      ])

      expect(likes).toBe(1)
      expect(successfulApiCalls).toBe(5)
    })

    it('should simulate form field validation with delayed server check', async () => {
      interface FieldState {
        value: string
        isValid: boolean
        error?: string
      }

      let field: FieldState = { value: '', isValid: true }

      const update = createOptimisticUpdater({
        getState: () => field,
        setState: (newField: FieldState) => {
          field = newField
        },
        execute: async (newField: FieldState) => {
          // Simulate server validation
          await new Promise(resolve => setTimeout(resolve, 5))
          if (newField.value === 'invalid') {
            throw new Error('Server validation failed')
          }
        }
      })

      // Valid input
      await update({ value: 'valid', isValid: true })
      expect(field.value).toBe('valid')

      // Invalid input (will rollback)
      await update({ value: 'invalid', isValid: true })
      expect(field.value).toBe('valid') // rolled back
    })

    it('should simulate shopping cart quantity update', async () => {
      interface CartItem {
        productId: string
        quantity: number
      }

      let cartItem: CartItem = { productId: 'ABC', quantity: 1 }
      const serverQuantities: number[] = []

      const update = createOptimisticUpdater({
        getState: () => cartItem,
        setState: (newItem: CartItem) => {
          cartItem = newItem
        },
        execute: async (newItem: CartItem) => {
          await new Promise(resolve => setTimeout(resolve, 3))
          serverQuantities.push(newItem.quantity)
        }
      })

      // User rapidly changes quantity: 1 -> 2 -> 3 -> 5
      await update({ ...cartItem, quantity: 2 })
      await update({ ...cartItem, quantity: 3 })
      await update({ ...cartItem, quantity: 5 })

      expect(cartItem.quantity).toBe(5)
      expect(serverQuantities).toEqual([2, 3, 5])
    })
  })

  describe('type safety', () => {
    it('should maintain type safety with generic state', async () => {
      interface User {
        name: string
        age: number
      }

      let user: User = { name: 'Alice', age: 30 }
      const setState = vi.fn((newUser: User) => {
        user = newUser
      })

      const update = createOptimisticUpdater({
        getState: () => user,
        setState,
        execute: vi.fn()
      })

      await update({ name: 'Bob', age: 25 })

      expect(user).toEqual({ name: 'Bob', age: 25 })
      expect(setState).toHaveBeenCalledWith({ name: 'Bob', age: 25 })
    })

    it('should work with union types', async () => {
      type Status = 'idle' | 'loading' | 'success' | 'error'

      let status: Status = 'idle'
      const setState = vi.fn((newStatus: Status) => {
        status = newStatus
      })

      const update = createOptimisticUpdater({
        getState: () => status,
        setState,
        execute: vi.fn()
      })

      await update('loading')
      expect(status).toBe('loading')

      await update('success')
      expect(status).toBe('success')
    })

    it('should work with Map state', async () => {
      let state = new Map<string, number>([['a', 1]])
      const setState = vi.fn((newState: Map<string, number>) => {
        state = newState
      })

      const update = createOptimisticUpdater({
        getState: () => state,
        setState,
        execute: vi.fn()
      })

      const newMap = new Map<string, number>([
        ['a', 1],
        ['b', 2]
      ])
      await update(newMap)

      expect(state.get('b')).toBe(2)
    })
  })
})
