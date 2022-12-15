import useObjectURLWithoutSetup from '/@/composables/dom/useObjectURL'
import { withSetup } from '../../testUtils'
import { nextTick, ref } from 'vue'
import path from 'node:path'
import fs from 'node:fs/promises'

const useObjectURL = withSetup(useObjectURLWithoutSetup)

const loadBlob = async (filename: string) => {
  const p = path.resolve(__dirname, filename)
  const buff = await fs.readFile(p)
  return new Blob([buff], { type: 'image/gif' })
}

describe('useObjectURL', () => {
  const revokedSet = new Set<string>()
  beforeEach(() => {
    let i = 0
    const originalCreateObjectURL = URL.createObjectURL
    URL.createObjectURL = vi.fn(() => `blob:${i++}`)
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn(v => {
      revokedSet.add(v)
    })

    return () => {
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
      revokedSet.clear()
    }
  })

  it('should work', async () => {
    const blob = ref<Blob | undefined>(await loadBlob('1.gif'))
    const [url] = useObjectURL(blob)
    expect(url.value).toBe('blob:0')
    expect(revokedSet.has('blob:0')).toBe(false)

    blob.value = await loadBlob('1.png')
    await nextTick()
    expect(url.value).toBe('blob:1')
    expect(revokedSet.has('blob:0')).toBe(true)

    blob.value = undefined
    await nextTick()
    expect(url.value).toBeUndefined()
    expect(revokedSet.has('blob:1')).toBe(true)
  })

  it('should revoke after unmount', async () => {
    const blob = ref<Blob | undefined>(await loadBlob('1.gif'))
    const [url, { unmount }] = useObjectURL(blob)
    expect(url.value).toBe('blob:0')

    unmount()
    expect(revokedSet.has('blob:0')).toBe(true)
  })
})
