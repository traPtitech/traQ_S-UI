import { withSetup } from '../../../../testUtils'
import { nextTick, ref } from 'vue'
import useOnAllRenderedWithoutSetup from '/@/components/Main/CommandPalette/composables/useOnAllRendered'

const useOnAllRendered = withSetup(useOnAllRenderedWithoutSetup)

describe('useOnAllRenderered', () => {
  it('should work', async () => {
    const list = ref(['a', 'b'])
    const f = vi.fn()

    const [{ onAllRendered, didRender }] = useOnAllRendered(list)
    onAllRendered(f)
    expect(f).not.toHaveBeenCalled()

    didRender('a')
    await nextTick()
    expect(f).not.toHaveBeenCalled()

    didRender('b')
    await nextTick()
    expect(f).toHaveBeenCalledOnce()
  })

  // listはreactiveではない
})
