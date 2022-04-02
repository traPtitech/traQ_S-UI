import type { FirebaseApp } from 'firebase/app'
import { initializeApp } from 'firebase/app'

let _firebaseApp: FirebaseApp | undefined

export const getFirebaseApp = () => {
  return _firebaseApp
}

export const setupFirebaseApp = () => {
  if (window.traQConfig.firebase === undefined) {
    return undefined
  }

  try {
    _firebaseApp = initializeApp(window.traQConfig.firebase)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] failed to initialize', e)
  }
  return _firebaseApp
}

// https://github.com/traPtitech/traQ/blob/d9ddb993d379c75baef3526b382a923719bad743/service/fcm/impl.go#L106-L114
export type FirebasePayloadData = {
  type: string
  title: string
  body: string
  path: string
  tag: string
  icon: string
  unread?: string
}
