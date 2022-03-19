import { reactive } from 'vue'
import useMaxLength from '/@/composables/utils/useMaxLength'

describe('useMaxLength', () => {
  it('should return length and is reactive', () => {
    const state = reactive({ val: 'aaa' })
    const { length } = useMaxLength(state)
    expect(length.value).toBe(3)
    state.val = 'b'
    expect(length.value).toBe(1)
  })

  it('isExceeded should return false when no maxLength', () => {
    const state = reactive({ val: 'aaa' })
    const { isExceeded } = useMaxLength(state)
    expect(isExceeded.value).toBe(false)
  })
  it('isExceeded should return false when not exceeded', () => {
    const state = reactive({ val: 'aaa', maxLength: 4 })
    const { isExceeded } = useMaxLength(state)
    expect(isExceeded.value).toBe(false)
  })
  it('isExceeded should return true when not exceeded', () => {
    const state = reactive({ val: 'aaa', maxLength: 2 })
    const { isExceeded } = useMaxLength(state)
    expect(isExceeded.value).toBe(true)
  })

  it('isExceeded is reactive (val)', () => {
    const state = reactive({ val: 'aaa', maxLength: 2 })
    const { isExceeded } = useMaxLength(state)
    expect(isExceeded.value).toBe(true)
    state.val = 'a'
    expect(isExceeded.value).toBe(false)
  })
  it('isExceeded is reactive (maxLength)', () => {
    const state = reactive({ val: 'aaa', maxLength: 2 })
    const { isExceeded } = useMaxLength(state)
    expect(isExceeded.value).toBe(true)
    state.maxLength = 4
    expect(isExceeded.value).toBe(false)
  })
})
