import { nextTick, ref } from 'vue'
import useLocalInput from '/@/composables/utils/useLocalInput'

describe('useLocalInput', () => {
  it('isEditing is false on init', () => {
    const { isEditing } = useLocalInput(ref(''), () => true)
    expect(isEditing.value).toBe(false)
  })

  it('initialValue is obtained from remoteValue', () => {
    const remoteValue = ref('init')
    const { localValue } = useLocalInput(remoteValue, () => true)
    expect(localValue.value).toBe('init')
  })

  it('localValue is synced when remoteValue changed', async () => {
    const remoteValue = ref('1')
    const { localValue } = useLocalInput(remoteValue, () => true)

    remoteValue.value = '2'
    await nextTick()
    expect(localValue.value).toBe('2')
  })

  it('localValue is not synced during editing', async () => {
    const remoteValue = ref('1')
    const { localValue, isEditing } = useLocalInput(remoteValue, () => true)
    isEditing.value = true

    remoteValue.value = '2'
    await nextTick()
    expect(localValue.value).toBe('1')

    isEditing.value = false
    await nextTick()
    expect(localValue.value).toBe('1') // 2になってもいいかも
  })

  it('localValue is synced during editing when syncEvenEditing is true', async () => {
    const remoteValue = ref('1')
    const { localValue, isEditing } = useLocalInput(
      remoteValue,
      () => true,
      true
    )
    isEditing.value = true

    remoteValue.value = '2'
    await nextTick()
    expect(localValue.value).toBe('2')
  })

  it('doUpdate is called after finish editing', async () => {
    const f = vi.fn().mockReturnValue(true)

    const remoteValue = ref('1')
    const { isEditing } = useLocalInput(remoteValue, f)
    isEditing.value = true
    await nextTick()
    expect(f).not.toHaveBeenCalled()

    isEditing.value = false
    await nextTick()
    expect(f).toHaveBeenCalledOnce()
    expect(f).toHaveBeenCalledWith('1')
    expect(isEditing.value).toBe(false)
  })

  it('isEditing becomes true when update failed', async () => {
    const f = vi.fn().mockReturnValue(false)

    const remoteValue = ref('1')
    const { isEditing } = useLocalInput(remoteValue, f)
    isEditing.value = true
    await nextTick()
    isEditing.value = false
    await nextTick()
    expect(isEditing.value).toBe(true)
  })

  it('sync function works', async () => {
    const f = vi.fn().mockReturnValue(false)

    const remoteValue = ref('1')
    const { localValue, isEditing, sync } = useLocalInput(remoteValue, f)
    isEditing.value = true
    localValue.value = '2'
    sync()
    expect(localValue.value).toBe('1')
  })
})
