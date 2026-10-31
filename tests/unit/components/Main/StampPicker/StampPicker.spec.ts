import { defineComponent, h, reactive, ref } from 'vue'

import { mount } from '@vue/test-utils'

import type * as Browser from '/@/lib/dom/browser'
import boolAttr from '/@/bool-attr'
import StampPicker from '/@/components/Main/StampPicker/StampPicker.vue'
import StampPickerStampList from '/@/components/Main/StampPicker/StampPickerStampList.vue'
import { shouldAutoFocus } from '/@/lib/dom/browser'

const { selectStamp } = vi.hoisted(() => ({ selectStamp: vi.fn() }))

vi.mock('/@/lib/dom/browser', async importOriginal => ({
  ...(await importOriginal<typeof Browser>()),
  shouldAutoFocus: vi.fn(() => true)
}))
vi.mock('/@/store/ui/stampPicker', () => ({
  useStampPicker: () => ({
    selectHandler: ref(selectStamp),
    isEffectEnabled: ref(false),
    currentStampSet: ref({ type: 'history', id: '' }),
    validateCurrentStampSet: vi.fn(),
    closeStampPicker: vi.fn()
  })
}))
vi.mock('/@/store/domain/stampHistory', () => ({
  useStampHistory: () => ({ upsertLocalStampHistory: vi.fn() })
}))
vi.mock('/@/store/domain/stampRecommendations', () => ({
  useStampRecommendations: () => ({ recordStampUsage: vi.fn() })
}))
vi.mock('/@/components/Main/StampPicker/composables/useStampList', () => ({
  default: () => ({
    stamps: ref([{ id: 'stamp-id' }]),
    filterState: reactive({ query: '' })
  })
}))
vi.mock(
  '/@/components/Main/StampPicker/composables/useStampSetSelector',
  () => ({
    default: () => ({ stampSetState: { stampSets: [] } })
  })
)

describe('StampPicker search focus', () => {
  beforeEach(() => {
    vi.mocked(shouldAutoFocus).mockReturnValue(true)
    selectStamp.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const setup = () => {
    const wrapper = mount(StampPicker, {
      attachTo: document.body,
      global: {
        plugins: [boolAttr],
        stubs: {
          ClickOutside: defineComponent(
            (_, { slots }) =>
              () =>
                h('div', slots['default']?.())
          ),
          AIcon: true,
          StampPickerStampList: true,
          StampPickerPreview: true,
          StampPickerStampSetSelector: true,
          StampPickerEffectToggleButton: true,
          StampPickerEffectSelector: true
        }
      }
    })
    const input = wrapper.get('input').element
    input.blur()
    const focus = vi.spyOn(input, 'focus')
    return { wrapper, input, focus }
  }

  it.each(['touch', 'pen'])(
    'does not refocus search after %s selection even when the device policy allows autofocus',
    pointerType => {
      const { wrapper, input, focus } = setup()
      const list = wrapper.getComponent(StampPickerStampList)
      const event = new Event('pointerdown', { bubbles: true })
      Object.assign(event, { pointerType })
      list.element.dispatchEvent(event)

      list.vm.$emit('inputStamp', 'stamp-id')

      expect(selectStamp).toHaveBeenCalledOnce()
      expect(selectStamp).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'stamp-id' }),
        { allowFocus: false }
      )
      expect(focus).not.toHaveBeenCalled()
      expect(document.activeElement).not.toBe(input)
      wrapper.unmount()
    }
  )

  it('restores search focus after a desktop mouse selection', () => {
    const { wrapper, input, focus } = setup()
    const list = wrapper.getComponent(StampPickerStampList)
    const event = new Event('pointerdown', { bubbles: true })
    Object.assign(event, { pointerType: 'mouse' })
    list.element.dispatchEvent(event)

    list.vm.$emit('inputStamp', 'stamp-id')

    expect(focus).toHaveBeenCalledOnce()
    expect(selectStamp).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'stamp-id' }),
      { allowFocus: true }
    )
    expect(document.activeElement).toBe(input)
    wrapper.unmount()
  })

  it('allows keyboard selection after a touch interaction', async () => {
    const { wrapper, input, focus } = setup()
    const list = wrapper.getComponent(StampPickerStampList)
    const event = new Event('pointerdown', { bubbles: true })
    Object.assign(event, { pointerType: 'touch' })
    list.element.dispatchEvent(event)

    await wrapper.get('input').trigger('keydown', { key: 'Enter' })

    expect(selectStamp).toHaveBeenCalledOnce()
    expect(focus).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(input)
    wrapper.unmount()
  })
})
