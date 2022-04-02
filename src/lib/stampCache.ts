import { get, set, del } from 'idb-keyval'
import type { Stamp } from '@traptitech/traq'
import { createStore } from '/@/lib/dom/idb'

const store = createStore('cache', 'stamps')

const UNICODE_STAMPS_KEY = 'unicode_stamps'

export const getUnicodeStamps = async () => {
  try {
    const stamps = await get<Stamp[]>(UNICODE_STAMPS_KEY, store)
    return stamps
  } catch {
    return undefined
  }
}

export const setUnicodeStamps = async (stamps: Stamp[]) => {
  await set(UNICODE_STAMPS_KEY, stamps, store)
}

export const deleteUnicodeStamps = async () => {
  await del(UNICODE_STAMPS_KEY, store)
}
