import mitt from 'mitt'
import { withSetup } from '../../testUtils'
import useMittListenerWithoutSetup from '/@/composables/utils/useMittListener'

const useMittListener = withSetup(useMittListenerWithoutSetup)

describe('useMittListener', () => {
  it('can listen', () => {
    const m = mitt<{ foo: string }>()
    const f = vi.fn()

    useMittListener(m, 'foo', f)
    m.emit('foo', 'foo')

    expect(f).toHaveBeenCalledOnce()
    expect(f).toHaveBeenCalledWith('foo')
  })

  it('can unlisten after unmount', () => {
    const m = mitt<{ foo: string }>()
    const f = vi.fn()

    const [, { unmount }] = useMittListener(m, 'foo', f)
    unmount()
    m.emit('foo', 'foo')

    expect(f).not.toHaveBeenCalled()
  })
})
