import { Theme } from './schema'
import indexedDBStorage from '/@/vuex/indexedDBStorage'

const hasKey = <K extends string>(
  obj: object,
  key: K
): obj is { [k in K]: unknown } => key in obj

const isObjectAndHasKey = <K extends string>(
  obj: unknown,
  key: K
): obj is { [k in K]: unknown } =>
  typeof obj === 'object' && obj !== null && hasKey(obj, key)

export const migrateThemeFromV1ToV2 = async () => {
  const store = await indexedDBStorage.getItem('vuex')
  if (!store) return

  try {
    if (!isObjectAndHasKey(store, 'app')) return
    if (!isObjectAndHasKey(store.app, 'themeSettings')) return
    if (!isObjectAndHasKey(store.app.themeSettings, 'custom')) return

    const maybeV1Theme = store.app.themeSettings.custom
    if (typeof maybeV1Theme !== 'object' || maybeV1Theme === null) {
      // eslint-disable-next-line no-console
      console.info('[Theme migration] Skipped because it was invalid.')
      return
    }

    if (hasKey(maybeV1Theme, 'version') && maybeV1Theme.version === 2) {
      // eslint-disable-next-line no-console
      console.info('[Theme migration] Skipped because it was already v2.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v2Theme: Theme = { version: 2, basic: maybeV1Theme as any }

    store.app.themeSettings.custom = v2Theme
    await indexedDBStorage.setItem('vuex', store)
    // eslint-disable-next-line no-console
    console.info('[Theme migration] Ran migration.', store)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[Theme migration] Failed to run: ', e)
  }
}
