import type { WatchSource } from 'vue'
import { effectScope, reactive, ref } from 'vue'

import useAsyncScope from '/@/composables/utils/useAsyncScope'

const disposers: Array<() => void> = []

const create = (sources: readonly WatchSource<unknown>[] = []) => {
  const scope = effectScope()
  let requests!: ReturnType<typeof useAsyncScope>
  scope.run(() => {
    requests = useAsyncScope(sources)
  })
  const dispose = () => scope.stop()
  disposers.push(dispose)
  return { ...requests, dispose }
}

afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

describe('useAsyncScope', () => {
  it('allows multiple operations to belong to the same scope', () => {
    const requests = create()
    const first = requests.capture()
    const second = requests.capture()

    expect(first()).toBe(true)
    expect(second()).toBe(true)
  })

  it('invalidates pending work while allowing work started after a reset', async () => {
    const pending = Promise.withResolvers<string>()
    const requests = create()
    const isCurrent = requests.capture()
    const apply = vi.fn()
    const operation = (async () => {
      const result = await pending.promise
      if (isCurrent()) apply(result)
    })()

    requests.invalidate()
    const current = requests.capture()
    pending.resolve('old result')
    await operation

    expect(apply).not.toHaveBeenCalled()
    expect(isCurrent()).toBe(false)
    expect(current()).toBe(true)
  })

  it('invalidates synchronously when a watched ref changes', () => {
    const id = ref('first')
    const requests = create([id])
    const isCurrent = requests.capture()
    id.value = 'second'

    expect(isCurrent()).toBe(false)
    expect(requests.capture()()).toBe(true)
  })

  it('accepts getters alongside refs to identify the current state', () => {
    const id = ref('same-channel')
    const props = reactive({ entryMessageId: 'first' })
    const requests = create([id, () => props.entryMessageId])
    const isCurrent = requests.capture()
    props.entryMessageId = 'second'

    expect(isCurrent()).toBe(false)
    expect(requests.capture()()).toBe(true)
  })

  it('does not restore old operations when a watched value changes back', () => {
    const id = ref('first')
    const requests = create([id])
    const isCurrent = requests.capture()
    id.value = 'second'
    id.value = 'first'

    expect(isCurrent()).toBe(false)
    expect(requests.capture()()).toBe(true)
  })

  it('permanently invalidates work when the Vue scope is disposed', () => {
    const requests = create()
    const isCurrent = requests.capture()
    requests.dispose()
    requests.invalidate()

    expect(isCurrent()).toBe(false)
    expect(requests.capture()()).toBe(false)
  })

  it('keeps independent instances separate', () => {
    const first = create()
    const second = create()
    const isFirstCurrent = first.capture()
    const isSecondCurrent = second.capture()
    first.invalidate()

    expect(isFirstCurrent()).toBe(false)
    expect(isSecondCurrent()).toBe(true)
  })
})
