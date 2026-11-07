import { readFile } from 'node:fs/promises'

import { vi } from 'vitest'

// The browser loader fetches an asset URL; Node tests load the same published
// Wasm bytes without a server, while exercising the real runtime and parser.
vi.mock('@traq-flavored-markdown/sdk/browser', async () => {
  const sdk = await import('@traq-flavored-markdown/sdk')
  const runtime = await sdk.createRuntime(
    await readFile('node_modules/@traq-flavored-markdown/sdk/dist/parser.wasm')
  )
  afterAll(() => runtime.dispose())
  return { ...sdk, loadRuntime: async () => runtime }
})
