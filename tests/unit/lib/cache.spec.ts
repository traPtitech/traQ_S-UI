import { Cache, IterableCache } from '/@/lib/cache'

describe('Cache', () => {
  describe('basic behavior', () => {
    describe('getOrCreate', () => {
      it('should create a value using the factory function when key does not exist', () => {
        const factory = vi.fn((key: { id: number }) => `value-${key.id}`)
        const cache = new Cache(factory)
        const key = { id: 1 }

        const result = cache.getOrCreate(key)

        expect(factory).toHaveBeenCalledWith(key)
        expect(result).toBe('value-1')
      })

      it('should return existing value without calling factory when key exists', () => {
        const factory = vi.fn((key: { id: number }) => `value-${key.id}`)
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        factory.mockClear()

        const result = cache.getOrCreate(key)

        expect(factory).not.toHaveBeenCalled()
        expect(result).toBe('value-1')
      })

      it('should use the same reference for the same key', () => {
        const factory = vi.fn((_key: object) => ({ data: 'created' }))
        const cache = new Cache(factory)
        const key = {}

        const first = cache.getOrCreate(key)
        const second = cache.getOrCreate(key)

        expect(first).toBe(second)
      })

      it('should create different values for different keys', () => {
        const factory = vi.fn((_key: object) => ({ data: Math.random() }))
        const cache = new Cache(factory)
        const key1 = { id: 1 }
        const key2 = { id: 2 }

        const result1 = cache.getOrCreate(key1)
        const result2 = cache.getOrCreate(key2)

        expect(result1).not.toBe(result2)
        expect(factory).toHaveBeenCalledTimes(2)
      })
    })

    describe('has', () => {
      it('should return false for non-existent key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        expect(cache.has(key)).toBe(false)
      })

      it('should return true for existing key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        cache.getOrCreate(key)

        expect(cache.has(key)).toBe(true)
      })

      it('should return true after set', () => {
        const cache = new Cache((_key: object) => 'factory-value')
        const key = { id: 1 }

        cache.set(key, 'manual-value')

        expect(cache.has(key)).toBe(true)
      })
    })

    describe('get', () => {
      it('should return undefined for non-existent key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        expect(cache.get(key)).toBeUndefined()
      })

      it('should return the value for existing key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        cache.getOrCreate(key)

        expect(cache.get(key)).toBe('value')
      })

      it('should not create value like getOrCreate', () => {
        const factory = vi.fn((_key: object) => 'value')
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.get(key)

        expect(factory).not.toHaveBeenCalled()
      })
    })

    describe('set', () => {
      it('should set a value for a key', () => {
        const cache = new Cache((_key: object) => 'factory-value')
        const key = { id: 1 }

        cache.set(key, 'manual-value')

        expect(cache.get(key)).toBe('manual-value')
      })

      it('should overwrite existing value', () => {
        const cache = new Cache((_key: object) => 'factory-value')
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.set(key, 'new-value')

        expect(cache.get(key)).toBe('new-value')
      })

      it('should return this for chaining', () => {
        const cache = new Cache((_key: object) => 'value')
        const key1 = { id: 1 }
        const key2 = { id: 2 }

        const result = cache.set(key1, 'value1').set(key2, 'value2')

        expect(result).toBe(cache)
        expect(cache.get(key1)).toBe('value1')
        expect(cache.get(key2)).toBe('value2')
      })
    })

    describe('delete', () => {
      it('should return false for non-existent key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        expect(cache.delete(key)).toBe(false)
      })

      it('should return true and remove existing key', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        cache.getOrCreate(key)
        const result = cache.delete(key)

        expect(result).toBe(true)
        expect(cache.has(key)).toBe(false)
      })

      it('should allow re-creation after delete', () => {
        const factory = vi.fn((_key: object) => ({ value: Math.random() }))
        const cache = new Cache(factory)
        const key = { id: 1 }

        const first = cache.getOrCreate(key)
        cache.delete(key)
        const second = cache.getOrCreate(key)

        expect(first).not.toBe(second)
        expect(factory).toHaveBeenCalledTimes(2)
      })
    })

    describe('clear', () => {
      it('should remove all entries', () => {
        const cache = new Cache((_key: object) => 'value')
        const key1 = { id: 1 }
        const key2 = { id: 2 }

        cache.getOrCreate(key1)
        cache.getOrCreate(key2)
        cache.clear()

        expect(cache.has(key1)).toBe(false)
        expect(cache.has(key2)).toBe(false)
      })

      it('should allow adding new entries after clear', () => {
        const cache = new Cache((_key: object) => 'value')
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.clear()
        cache.getOrCreate(key)

        expect(cache.has(key)).toBe(true)
      })
    })
  })

  describe('edge cases', () => {
    describe('falsy values handling', () => {
      it('should cache null values without re-creating', () => {
        const factory = vi.fn((_key: object) => null as null | string)
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.getOrCreate(key)

        // factory should only be called once since null is cached
        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get(key)).toBeNull()
      })

      it('should cache 0 values without re-creating', () => {
        const factory = vi.fn((_key: object) => 0)
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.getOrCreate(key)

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get(key)).toBe(0)
      })

      it('should cache empty string values without re-creating', () => {
        const factory = vi.fn((_key: object) => '')
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.getOrCreate(key)

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get(key)).toBe('')
      })

      it('should cache false values without re-creating', () => {
        const factory = vi.fn((_key: object) => false)
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.getOrCreate(key)

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get(key)).toBe(false)
      })

      it('should re-create value when factory returns undefined', () => {
        const factory = vi.fn((_key: object) => undefined as undefined | string)
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.getOrCreate(key)
        cache.getOrCreate(key)
        cache.getOrCreate(key)

        // factory should be called every time since undefined is not cached
        expect(factory).toHaveBeenCalledTimes(3)
      })

      it('should re-create value when set to undefined', () => {
        const factory = vi.fn((_key: object) => 'new-value')
        const cache = new Cache(factory)
        const key = { id: 1 }

        cache.set(key, undefined as unknown as string)
        cache.getOrCreate(key)

        // factory should be called since value was set to undefined
        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get(key)).toBe('new-value')
      })
    })

    it('should handle complex object keys', () => {
      const cache = new Cache(
        (key: { nested: { id: number } }) => key.nested.id
      )
      const key = { nested: { id: 42 } }

      const result = cache.getOrCreate(key)

      expect(result).toBe(42)
    })

    it('should handle factory that throws', () => {
      const cache = new Cache((_key: object) => {
        throw new Error('factory error')
      })
      const key = { id: 1 }

      expect(() => cache.getOrCreate(key)).toThrow('factory error')
    })

    it('should use WeakMap behavior (rejects primitive keys)', () => {
      // This test verifies that Cache uses WeakMap which rejects primitive keys
      const cache = new Cache((_key: object) => 'value')

      // Verify it's using WeakMap by checking that primitive keys are not allowed
      expect(() => {
        // @ts-expect-error - Testing runtime behavior with invalid key type
        cache.set('string-key', 'value')
      }).toThrow() // WeakMap throws TypeError for non-object keys
    })
  })

  describe('combined operations', () => {
    it('should use set value over factory in getOrCreate', () => {
      const factory = vi.fn((_key: object) => 'factory-value')
      const cache = new Cache(factory)
      const key = { id: 1 }

      cache.set(key, 'set-value')
      const result = cache.getOrCreate(key)

      expect(result).toBe('set-value')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory after delete even if previously set', () => {
      const factory = vi.fn((_key: object) => 'factory-value')
      const cache = new Cache(factory)
      const key = { id: 1 }

      cache.set(key, 'set-value')
      cache.delete(key)
      const result = cache.getOrCreate(key)

      expect(result).toBe('factory-value')
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should call factory after clear', () => {
      const factory = vi.fn((_key: object) => 'factory-value')
      const cache = new Cache(factory)
      const key = { id: 1 }

      cache.getOrCreate(key)
      cache.clear()
      factory.mockClear()

      cache.getOrCreate(key)

      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should handle set → delete → set → getOrCreate sequence', () => {
      const factory = vi.fn((_key: object) => 'factory-value')
      const cache = new Cache(factory)
      const key = { id: 1 }

      cache.set(key, 'first')
      cache.delete(key)
      cache.set(key, 'second')
      const result = cache.getOrCreate(key)

      expect(result).toBe('second')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should handle multiple keys independently', () => {
      const factory = vi.fn((key: { id: number }) => `value-${key.id}`)
      const cache = new Cache(factory)
      const key1 = { id: 1 }
      const key2 = { id: 2 }
      const key3 = { id: 3 }

      cache.getOrCreate(key1)
      cache.set(key2, 'manual-2')
      cache.getOrCreate(key3)
      cache.delete(key1)

      expect(cache.has(key1)).toBe(false)
      expect(cache.get(key2)).toBe('manual-2')
      expect(cache.get(key3)).toBe('value-3')
      expect(factory).toHaveBeenCalledTimes(2)
    })
  })

  describe('factory patterns', () => {
    it('should work with stateful factory', () => {
      let counter = 0
      const factory = vi.fn((_key: object) => ++counter)
      const cache = new Cache(factory)
      const key1 = { id: 1 }
      const key2 = { id: 2 }

      expect(cache.getOrCreate(key1)).toBe(1)
      expect(cache.getOrCreate(key2)).toBe(2)
      expect(cache.getOrCreate(key1)).toBe(1) // cached, counter not incremented
    })

    it('should work with factory that uses key properties', () => {
      const factory = (key: { name: string; age: number }) =>
        `${key.name} is ${key.age} years old`
      const cache = new Cache(factory)

      const person = { name: 'Alice', age: 30 }
      expect(cache.getOrCreate(person)).toBe('Alice is 30 years old')
    })

    it('should work with factory that returns functions', () => {
      const factory = (key: { multiplier: number }) => (x: number) =>
        x * key.multiplier
      const cache = new Cache(factory)

      const double = { multiplier: 2 }
      const triple = { multiplier: 3 }

      const doubleFn = cache.getOrCreate(double)
      const tripleFn = cache.getOrCreate(triple)

      expect(doubleFn(5)).toBe(10)
      expect(tripleFn(5)).toBe(15)
    })

    it('should pass the exact key reference to factory', () => {
      const factory = vi.fn((key: object) => key)
      const cache = new Cache(factory)
      const key = { id: 1 }

      cache.getOrCreate(key)

      expect(factory).toHaveBeenCalledWith(key)
      expect(factory.mock.calls[0]?.[0]).toBe(key) // same reference
    })
  })

  describe('key identity', () => {
    it('should treat different object references as different keys', () => {
      const factory = vi.fn((_key: object) => Math.random())
      const cache = new Cache(factory)

      const key1 = { id: 1 }
      const key2 = { id: 1 } // same content, different reference

      cache.getOrCreate(key1)
      cache.getOrCreate(key2)

      expect(factory).toHaveBeenCalledTimes(2)
    })

    it('should maintain key identity after property mutation', () => {
      const factory = vi.fn((key: { id: number }) => key.id)
      const cache = new Cache(factory)
      const key = { id: 1 }

      const firstResult = cache.getOrCreate(key)
      key.id = 999 // mutate the key
      const secondResult = cache.getOrCreate(key)

      // Should return cached value despite mutation
      expect(firstResult).toBe(1)
      expect(secondResult).toBe(1)
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should work with class instances as keys', () => {
      class User {
        constructor(public id: number) {}
      }

      const factory = (user: User) => `User-${user.id}`
      const cache = new Cache(factory)

      const user1 = new User(1)
      const user2 = new User(2)

      expect(cache.getOrCreate(user1)).toBe('User-1')
      expect(cache.getOrCreate(user2)).toBe('User-2')
      expect(cache.getOrCreate(user1)).toBe('User-1') // cached
    })

    it('should work with arrays as keys', () => {
      const factory = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
      const cache = new Cache(factory)

      const arr1 = [1, 2, 3]
      const arr2 = [1, 2, 3] // same content, different reference

      expect(cache.getOrCreate(arr1)).toBe(6)
      expect(cache.getOrCreate(arr2)).toBe(6)

      // Different references means different cache entries
      expect(cache.has(arr1)).toBe(true)
      expect(cache.has(arr2)).toBe(true)
    })
  })
})

describe('IterableCache', () => {
  describe('basic behavior', () => {
    describe('getOrCreate', () => {
      it('should create a value using the factory function when key does not exist', () => {
        const factory = vi.fn((key: string) => `value-${key}`)
        const cache = new IterableCache(factory)

        const result = cache.getOrCreate('key1')

        expect(factory).toHaveBeenCalledWith('key1')
        expect(result).toBe('value-key1')
      })

      it('should return existing value without calling factory when key exists', () => {
        const factory = vi.fn((key: string) => `value-${key}`)
        const cache = new IterableCache(factory)

        cache.getOrCreate('key1')
        factory.mockClear()

        const result = cache.getOrCreate('key1')

        expect(factory).not.toHaveBeenCalled()
        expect(result).toBe('value-key1')
      })

      it('should work with any key type', () => {
        const factory = vi.fn((key: number) => key * 2)
        const cache = new IterableCache(factory)

        expect(cache.getOrCreate(5)).toBe(10)
        expect(cache.getOrCreate(10)).toBe(20)
      })
    })

    describe('has', () => {
      it('should return false for non-existent key', () => {
        const cache = new IterableCache((key: string) => key)

        expect(cache.has('missing')).toBe(false)
      })

      it('should return true for existing key', () => {
        const cache = new IterableCache((key: string) => key)

        cache.getOrCreate('exists')

        expect(cache.has('exists')).toBe(true)
      })
    })

    describe('get', () => {
      it('should return undefined for non-existent key', () => {
        const cache = new IterableCache((key: string) => key)

        expect(cache.get('missing')).toBeUndefined()
      })

      it('should return the value for existing key', () => {
        const cache = new IterableCache((key: string) => `value-${key}`)

        cache.getOrCreate('test')

        expect(cache.get('test')).toBe('value-test')
      })
    })

    describe('set', () => {
      it('should set a value for a key', () => {
        const cache = new IterableCache((key: string) => `factory-${key}`)

        cache.set('key', 'manual-value')

        expect(cache.get('key')).toBe('manual-value')
      })

      it('should return this for chaining', () => {
        const cache = new IterableCache((key: string) => key)

        const result = cache.set('a', '1').set('b', '2')

        expect(result).toBe(cache)
      })
    })

    describe('delete', () => {
      it('should return true and remove existing key', () => {
        const cache = new IterableCache((key: string) => key)

        cache.getOrCreate('test')
        const result = cache.delete('test')

        expect(result).toBe(true)
        expect(cache.has('test')).toBe(false)
      })

      it('should return false for non-existent key', () => {
        const cache = new IterableCache((key: string) => key)

        expect(cache.delete('missing')).toBe(false)
      })
    })

    describe('clear', () => {
      it('should remove all entries', () => {
        const cache = new IterableCache((key: string) => key)

        cache.getOrCreate('a')
        cache.getOrCreate('b')
        cache.getOrCreate('c')
        cache.clear()

        expect(cache.size).toBe(0)
        expect(cache.has('a')).toBe(false)
        expect(cache.has('b')).toBe(false)
        expect(cache.has('c')).toBe(false)
      })
    })
  })

  describe('iteration methods', () => {
    describe('size', () => {
      it('should return 0 for empty cache', () => {
        const cache = new IterableCache((key: string) => key)

        expect(cache.size).toBe(0)
      })

      it('should return correct count after additions', () => {
        const cache = new IterableCache((key: string) => key)

        cache.getOrCreate('a')
        cache.getOrCreate('b')
        cache.getOrCreate('c')

        expect(cache.size).toBe(3)
      })

      it('should update after deletion', () => {
        const cache = new IterableCache((key: string) => key)

        cache.getOrCreate('a')
        cache.getOrCreate('b')
        cache.delete('a')

        expect(cache.size).toBe(1)
      })
    })

    describe('forEach', () => {
      it('should iterate over all entries', () => {
        const cache = new IterableCache((key: string) => `value-${key}`)
        const entries: [string, string][] = []

        cache.getOrCreate('a')
        cache.getOrCreate('b')
        cache.forEach((value, key) => entries.push([key, value]))

        expect(entries).toHaveLength(2)
        expect(entries).toContainEqual(['a', 'value-a'])
        expect(entries).toContainEqual(['b', 'value-b'])
      })

      it('should not call callback for empty cache', () => {
        const cache = new IterableCache((key: string) => key)
        const callback = vi.fn()

        cache.forEach(callback)

        expect(callback).not.toHaveBeenCalled()
      })
    })

    describe('values', () => {
      it('should return iterator of values', () => {
        const cache = new IterableCache((key: string) => `value-${key}`)

        cache.getOrCreate('a')
        cache.getOrCreate('b')

        const values = [...cache.values()]

        expect(values).toHaveLength(2)
        expect(values).toContain('value-a')
        expect(values).toContain('value-b')
      })

      it('should return empty iterator for empty cache', () => {
        const cache = new IterableCache((key: string) => key)

        const values = [...cache.values()]

        expect(values).toHaveLength(0)
      })
    })

    describe('keys', () => {
      it('should return iterator of keys', () => {
        const cache = new IterableCache((key: string) => `value-${key}`)

        cache.getOrCreate('x')
        cache.getOrCreate('y')

        const keys = [...cache.keys()]

        expect(keys).toHaveLength(2)
        expect(keys).toContain('x')
        expect(keys).toContain('y')
      })
    })

    describe('entries', () => {
      it('should return iterator of key-value pairs', () => {
        const cache = new IterableCache((key: string) => `value-${key}`)

        cache.getOrCreate('p')
        cache.getOrCreate('q')

        const entries = [...cache.entries()]

        expect(entries).toHaveLength(2)
        expect(entries).toContainEqual(['p', 'value-p'])
        expect(entries).toContainEqual(['q', 'value-q'])
      })
    })
  })

  describe('edge cases', () => {
    describe('falsy values handling', () => {
      it('should cache null values without re-creating', () => {
        const factory = vi.fn((_key: string) => null as null | string)
        const cache = new IterableCache(factory)

        cache.getOrCreate('key')
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get('key')).toBeNull()
      })

      it('should cache 0 values without re-creating', () => {
        const factory = vi.fn((_key: string) => 0)
        const cache = new IterableCache(factory)

        cache.getOrCreate('key')
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get('key')).toBe(0)
      })

      it('should cache empty string values without re-creating', () => {
        const factory = vi.fn((_key: string) => '')
        const cache = new IterableCache(factory)

        cache.getOrCreate('key')
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get('key')).toBe('')
      })

      it('should cache false values without re-creating', () => {
        const factory = vi.fn((_key: string) => false)
        const cache = new IterableCache(factory)

        cache.getOrCreate('key')
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get('key')).toBe(false)
      })

      it('should re-create value when factory returns undefined', () => {
        const factory = vi.fn((_key: string) => undefined as undefined | string)
        const cache = new IterableCache(factory)

        cache.getOrCreate('key')
        cache.getOrCreate('key')
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(3)
      })

      it('should re-create value when set to undefined', () => {
        const factory = vi.fn((_key: string) => 'new-value')
        const cache = new IterableCache(factory)

        cache.set('key', undefined as unknown as string)
        cache.getOrCreate('key')

        expect(factory).toHaveBeenCalledTimes(1)
        expect(cache.get('key')).toBe('new-value')
      })
    })
    it('should handle various key types (string)', () => {
      const cache = new IterableCache((key: string) => key.toUpperCase())

      expect(cache.getOrCreate('hello')).toBe('HELLO')
    })

    it('should handle various key types (number)', () => {
      const cache = new IterableCache((key: number) => key * 10)

      expect(cache.getOrCreate(5)).toBe(50)
    })

    it('should handle various key types (object)', () => {
      const cache = new IterableCache((key: { id: number }) => key.id)
      const key = { id: 42 }

      expect(cache.getOrCreate(key)).toBe(42)
    })

    it('should handle factory that returns complex objects', () => {
      const cache = new IterableCache((key: string) => ({
        key,
        created: Date.now(),
        nested: { data: [1, 2, 3] }
      }))

      const result = cache.getOrCreate('test')

      expect(result.key).toBe('test')
      expect(result.nested.data).toEqual([1, 2, 3])
    })

    it('should maintain insertion order in iterations', () => {
      const cache = new IterableCache((key: string) => key)

      cache.getOrCreate('first')
      cache.getOrCreate('second')
      cache.getOrCreate('third')

      const keys = [...cache.keys()]

      expect(keys).toEqual(['first', 'second', 'third'])
    })

    it('should handle factory that throws', () => {
      const cache = new IterableCache((_key: string) => {
        throw new Error('factory error')
      })

      expect(() => cache.getOrCreate('test')).toThrow('factory error')
    })

    it('should maintain separate state for different instances', () => {
      const cache1 = new IterableCache((key: string) => `cache1-${key}`)
      const cache2 = new IterableCache((key: string) => `cache2-${key}`)

      cache1.getOrCreate('shared-key')
      cache2.getOrCreate('shared-key')

      expect(cache1.get('shared-key')).toBe('cache1-shared-key')
      expect(cache2.get('shared-key')).toBe('cache2-shared-key')

      cache1.clear()

      expect(cache1.size).toBe(0)
      expect(cache2.size).toBe(1)
    })
  })

  describe('combined operations', () => {
    it('should use set value over factory in getOrCreate', () => {
      const factory = vi.fn((_key: string) => 'factory-value')
      const cache = new IterableCache(factory)

      cache.set('key', 'set-value')
      const result = cache.getOrCreate('key')

      expect(result).toBe('set-value')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory after delete even if previously set', () => {
      const factory = vi.fn((_key: string) => 'factory-value')
      const cache = new IterableCache(factory)

      cache.set('key', 'set-value')
      cache.delete('key')
      const result = cache.getOrCreate('key')

      expect(result).toBe('factory-value')
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should call factory after clear', () => {
      const factory = vi.fn((_key: string) => 'factory-value')
      const cache = new IterableCache(factory)

      cache.getOrCreate('key')
      cache.clear()
      factory.mockClear()

      cache.getOrCreate('key')

      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should handle set → delete → set → getOrCreate sequence', () => {
      const factory = vi.fn((_key: string) => 'factory-value')
      const cache = new IterableCache(factory)

      cache.set('key', 'first')
      cache.delete('key')
      cache.set('key', 'second')
      const result = cache.getOrCreate('key')

      expect(result).toBe('second')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should handle multiple keys independently', () => {
      const factory = vi.fn((key: string) => `value-${key}`)
      const cache = new IterableCache(factory)

      cache.getOrCreate('key1')
      cache.set('key2', 'manual-2')
      cache.getOrCreate('key3')
      cache.delete('key1')

      expect(cache.has('key1')).toBe(false)
      expect(cache.get('key2')).toBe('manual-2')
      expect(cache.get('key3')).toBe('value-key3')
      expect(cache.size).toBe(2)
      expect(factory).toHaveBeenCalledTimes(2)
    })

    it('should reflect operations in iteration methods', () => {
      const cache = new IterableCache((key: string) => `value-${key}`)

      cache.getOrCreate('a')
      cache.getOrCreate('b')
      cache.set('c', 'manual-c')
      cache.delete('a')

      const keys = [...cache.keys()]
      const values = [...cache.values()]
      const entries = [...cache.entries()]

      expect(keys).toEqual(['b', 'c'])
      expect(values).toEqual(['value-b', 'manual-c'])
      expect(entries).toEqual([
        ['b', 'value-b'],
        ['c', 'manual-c']
      ])
    })
  })

  describe('factory patterns', () => {
    it('should work with stateful factory', () => {
      let counter = 0
      const factory = vi.fn((_key: string) => ++counter)
      const cache = new IterableCache(factory)

      expect(cache.getOrCreate('a')).toBe(1)
      expect(cache.getOrCreate('b')).toBe(2)
      expect(cache.getOrCreate('a')).toBe(1) // cached
    })

    it('should work with factory that uses key', () => {
      const factory = (key: string) => key.split('').reverse().join('')
      const cache = new IterableCache(factory)

      expect(cache.getOrCreate('hello')).toBe('olleh')
      expect(cache.getOrCreate('world')).toBe('dlrow')
    })

    it('should work with factory that returns functions', () => {
      const factory = (prefix: string) => (suffix: string) =>
        `${prefix}-${suffix}`
      const cache = new IterableCache(factory)

      const helloFn = cache.getOrCreate('hello')
      const worldFn = cache.getOrCreate('world')

      expect(helloFn('there')).toBe('hello-there')
      expect(worldFn('wide')).toBe('world-wide')
    })

    it('should pass the exact key to factory', () => {
      const factory = vi.fn((key: string) => key)
      const cache = new IterableCache(factory)

      cache.getOrCreate('test-key')

      expect(factory).toHaveBeenCalledWith('test-key')
    })
  })

  describe('key identity', () => {
    it('should treat same primitive values as same key', () => {
      const factory = vi.fn((_key: string) => Math.random())
      const cache = new IterableCache(factory)

      const result1 = cache.getOrCreate('same')
      const result2 = cache.getOrCreate('same')

      expect(result1).toBe(result2)
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should treat same number values as same key', () => {
      const factory = vi.fn((_key: number) => Math.random())
      const cache = new IterableCache(factory)

      const result1 = cache.getOrCreate(42)
      const result2 = cache.getOrCreate(42)

      expect(result1).toBe(result2)
      expect(factory).toHaveBeenCalledTimes(1)
    })

    it('should treat different object references as different keys (Map behavior)', () => {
      const factory = vi.fn((_key: object) => Math.random())
      const cache = new IterableCache(factory)

      const key1 = { id: 1 }
      const key2 = { id: 1 } // same content, different reference

      cache.getOrCreate(key1)
      cache.getOrCreate(key2)

      expect(factory).toHaveBeenCalledTimes(2)
      expect(cache.size).toBe(2)
    })

    it('should treat same object reference as same key', () => {
      const factory = vi.fn((_key: object) => Math.random())
      const cache = new IterableCache(factory)

      const key = { id: 1 }

      cache.getOrCreate(key)
      cache.getOrCreate(key)

      expect(factory).toHaveBeenCalledTimes(1)
      expect(cache.size).toBe(1)
    })

    it('should handle NaN as key (Map behavior)', () => {
      const factory = vi.fn((_key: number) => 'nan-value')
      const cache = new IterableCache(factory)

      cache.getOrCreate(NaN)
      cache.getOrCreate(NaN)

      // Map treats NaN === NaN for key comparison
      expect(factory).toHaveBeenCalledTimes(1)
      expect(cache.size).toBe(1)
    })

    it('should treat -0 and +0 as same key (Map behavior)', () => {
      const factory = vi.fn((_key: number) => 'zero-value')
      const cache = new IterableCache(factory)

      cache.getOrCreate(-0)
      cache.getOrCreate(+0)

      // Map treats -0 and +0 as same key
      expect(factory).toHaveBeenCalledTimes(1)
      expect(cache.size).toBe(1)
    })
  })
})
