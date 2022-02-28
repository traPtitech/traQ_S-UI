import { migrateThemeFromV1ToV2 } from '/@/lib/theme/migrate'
;(async () => {
  await migrateThemeFromV1ToV2()

  // TODO: app.tsを読み込んだタイミングでstoreが初期化されるので、
  // マイグレーション後に発生させるために、
  // dynamic importしている
  // (top-level awaitだとうまくいかなかった)
  await import('./app')
})()
