import useObjectURLWithoutSetup from '/@/composables/dom/useObjectURL'
import { withSetup } from '../../testUtils'
import { nextTick, ref } from 'vue'
import path from 'node:path'
import fs from 'node:fs/promises'
import type { SpyInstance } from 'vitest'

const useObjectURL = withSetup(useObjectURLWithoutSetup)

const loadBlob = async (filename: string) => {
  const p = path.resolve(__dirname, filename)
  const buff = await fs.readFile(p)
  return new Blob([buff], { type: 'image/gif' })
}

describe('useObjectURL', () => {
  let mock1: SpyInstance, mock2: SpyInstance
  const revokedSet = new Set<string>()
  beforeEach(() => {
    let i = 0
    mock1 = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:${i++}`)
    mock2 = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(v => {
      revokedSet.add(v)
    })
  })
  afterEach(() => {
    mock1.mockReset()
    mock2.mockReset()
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
