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
