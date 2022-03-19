import { ref } from 'vue'
import useToggle from '/@/composables/utils/useToggle'

describe('useToggle', () => {
  it.concurrent('initial default value', () => {
    const { value } = useToggle()
    expect(value.value).toBe(false)
  })
  it.concurrent('initial value', () => {
    const { value } = useToggle(true)
    expect(value.value).toBe(true)
  })
  it.concurrent('initial value with ref passes through', () => {
    const r = ref(false)
    const { value } = useToggle(r)
    expect(value).toBe(r)
  })

  it.concurrent('can toggle', () => {
    const { value, toggle } = useToggle()
    const before = value.value
    toggle()
    const after = value.value
    expect(after).toBe(!before)
  })
  it.concurrent('initial value with ref can toggle', () => {
    const r = ref(false)
    const { toggle } = useToggle(r)
    const before = r.value
    toggle()
    const after = r.value
    expect(after).toBe(!before)
  })

  it.concurrent('can open', () => {
    const { value, open } = useToggle()
    open()
    expect(value.value).toBe(true)
  })

  it.concurrent('can close', () => {
    const { value, close } = useToggle()
    close()
    expect(value.value).toBe(false)
  })
})
