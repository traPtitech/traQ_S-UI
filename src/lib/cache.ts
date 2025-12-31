import { isDefined } from './basic/array'

interface CacheMap<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): this
  has(key: K): boolean
  delete(key: K): boolean
}

abstract class BaseCache<K, V, M extends CacheMap<K, V>> {
  protected abstract cache: M
  protected readonly factory: (key: K) => V

  constructor(factory: (key: K) => V) {
    this.factory = factory
  }

  getOrCreate(key: K): V {
    let existing = this.cache.get(key)

    if (!isDefined(existing)) {
      this.cache.set(key, (existing = this.factory(key)))
    }

    return existing
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  set(key: K, value: V): this {
    this.cache.set(key, value)
    return this
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  abstract clear(): void
}

export class Cache<K extends object, V> extends BaseCache<K, V, WeakMap<K, V>> {
  protected cache: WeakMap<K, V>

  constructor(factory: (key: K) => V) {
    super(factory)
    this.cache = new WeakMap()
  }

  clear(): void {
    this.cache = new WeakMap()
  }
}

export class IterableCache<K, V> extends BaseCache<K, V, Map<K, V>> {
  protected cache: Map<K, V>

  constructor(factory: (key: K) => V) {
    super(factory)
    this.cache = new Map()
  }

  clear(): void {
    this.cache.clear()
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach(callback)
  }

  get size(): number {
    return this.cache.size
  }

  values(): IterableIterator<V> {
    return this.cache.values()
  }

  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  entries(): IterableIterator<[K, V]> {
    return this.cache.entries()
  }
}
