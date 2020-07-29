import { Store, get, set } from 'idb-keyval'
import { Stamp } from '@traptitech/traq'

const store = new Store('traQ_S-cache', 'stamps')

const UNICODE_STAMPS_KEY = 'unicode_stamps'

export const getUnicodeStamps = async () => {
  try {
    const stamps = await get<Stamp[] | undefined>(UNICODE_STAMPS_KEY, store)
    return stamps
  } catch {
    return undefined
  }
}

export const setUnicodeStamps = async (stamps: Stamp[]) => {
  await set(UNICODE_STAMPS_KEY, stamps, store)
}
