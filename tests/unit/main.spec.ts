const { initializeMeta, createApp, app, setupGlobalFuncs } = vi.hoisted(() => {
  const app = { use: vi.fn(), mount: vi.fn(), config: {} }
  return {
    initializeMeta: vi.fn(),
    createApp: vi.fn(() => app),
    app,
    setupGlobalFuncs: vi.fn()
  }
})

vi.mock('vue', () => ({ createApp }))
vi.mock('/@/lib/apis', () => ({ initializeMeta }))
vi.mock('/@/App.vue', () => ({ default: {} }))
vi.mock('/@/bool-attr', () => ({ default: {} }))
vi.mock('/@/router', () => ({ default: {} }))
vi.mock('/@/store', () => ({ default: {} }))
vi.mock('/@/markdown-bridge', () => ({ setupGlobalFuncs }))
vi.mock('/@/lib/stampCache', () => ({ deleteStampCacheIDB: vi.fn() }))

it('waits for metadata before initializing the app', async () => {
  const meta = Promise.withResolvers<void>()
  initializeMeta.mockReturnValue(meta.promise)

  await import('/@/main')

  expect(initializeMeta).toHaveBeenCalledOnce()
  expect(setupGlobalFuncs).not.toHaveBeenCalled()
  expect(createApp).not.toHaveBeenCalled()

  meta.resolve()

  await vi.waitFor(() => {
    expect(setupGlobalFuncs).toHaveBeenCalledOnce()
    expect(app.mount).toHaveBeenCalledWith('#app')
  })
})
