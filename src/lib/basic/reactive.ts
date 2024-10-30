import { toRaw } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toString = (x: any) => Object.prototype.toString.call(x)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPlainObject(x: unknown): x is Record<any, any> {
  return toString(x) === '[object Object]'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toRawDeep = (value: any, map = new WeakMap()) => {
  if (map.has(value)) {
    return map.get(value)
  }

  if (
    !Array.isArray(value) &&
    !isPlainObject(value) &&
    !(value instanceof Map)
  ) {
    return value
  }

  const newValue = toRaw(value)
  map.set(value, newValue)

  if (Array.isArray(newValue)) {
    for (let i = 0; i < newValue.length; i++) {
      newValue[i] = toRawDeep(newValue[i], map)
    }
  } else if (newValue instanceof Map) {
    newValue.forEach((v, k) => newValue.set(k, toRawDeep(v, map)))
  } else {
    for (const k of Object.keys(newValue)) {
      newValue[k] = toRawDeep(newValue[k], map)
    }
  }

  return newValue
}
