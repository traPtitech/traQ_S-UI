import type firebase from 'firebase/app'

let _firebase: typeof firebase | null

export const loadFirebase = async () => {
  if (_firebase) {
    return _firebase
  }

  _firebase = (await import('firebase/app')).default
  await import('firebase/messaging')
  return _firebase
}

export const setupFirebase = async () => {
  if (window.traQConfig.firebase === undefined) {
    return
  }

  const fb = await loadFirebase()
  try {
    fb.initializeApp(window.traQConfig.firebase)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[Firebase] failed to initialize', e)
  }
  return fb
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
