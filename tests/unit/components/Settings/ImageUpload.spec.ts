import { nextTick } from 'vue'

import type CropperHandle from '@cropper/element-handle'
import CropperImage from '@cropper/element-image'
import CropperSelection from '@cropper/element-selection'
import { mount } from '@vue/test-utils'

import ImageUpload from '/@/components/Settings/ImageUpload.vue'

const imageFile = (type = 'image/png') =>
  new File(['image'], `image.${type.split('/')[1]}`, { type })
const mountImageUpload = (props: Record<string, unknown>) =>
  mount(ImageUpload, {
    props,
    global: {
      mocks: { $boolAttr: (value: boolean) => (value ? '' : undefined) }
    }
  })

describe('ImageUpload', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:image')
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(CropperImage.prototype, '$ready').mockResolvedValue(
      document.createElement('img')
    )
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('matches the default drag behavior and keeps the selection in the canvas', async () => {
    const wrapper = mountImageUpload({ modelValue: imageFile() })
    const canvasHandle = wrapper.get('cropper-handle')
    const selection = wrapper.get('cropper-selection')
    const selectionHandle = wrapper.get('cropper-selection cropper-handle')

    expect(wrapper.get('cropper-image').attributes()).toMatchObject({
      'initial-fit': 'cover',
      'min-fit': 'cover'
    })
    expect((canvasHandle.element as CropperHandle).action).toBe('move')
    expect((selection.element as CropperSelection).movable).toBe(false)
    expect(
      wrapper
        .findAll('cropper-selection cropper-handle')
        .slice(1)
        .every(
          handle =>
            handle.attributes('theme-color') === 'rgba(51, 153, 255, 0.75)'
        )
    ).toBe(true)

    await selectionHandle.trigger('dblclick')
    expect((canvasHandle.element as CropperHandle).action).toBe('select')

    const canvas = wrapper.get('cropper-canvas').element
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 280,
      height: 280
    } as DOMRect)
    const selectionChangeEvent = new CustomEvent('change', {
      cancelable: true,
      detail: { x: -1, y: 0, width: 280, height: 280 }
    })

    selection.element.dispatchEvent(selectionChangeEvent)
    expect(selectionChangeEvent.defaultPrevented).toBe(true)

    const shrinkSelectionEvent = new CustomEvent('change', {
      cancelable: true,
      detail: { x: 0, y: 0, width: 279, height: 279 }
    })

    selection.element.dispatchEvent(shrinkSelectionEvent)
    await nextTick()
    expect(shrinkSelectionEvent.defaultPrevented).toBe(false)
    expect((selection.element as CropperSelection).movable).toBe(true)

    const imageChangeEvent = new CustomEvent('change', {
      cancelable: true,
      detail: { x: -1, y: 0, width: 281, height: 280 }
    })

    wrapper.get('cropper-image').element.dispatchEvent(imageChangeEvent)
    expect(imageChangeEvent.defaultPrevented).toBe(false)

    const imageOutOfBoundsEvent = new CustomEvent('change', {
      cancelable: true,
      detail: { x: 1, y: -5, width: 281, height: 285 }
    })

    wrapper.get('cropper-image').element.dispatchEvent(imageOutOfBoundsEvent)
    expect(imageOutOfBoundsEvent.defaultPrevented).toBe(false)

    const setTransform = vi
      .spyOn(CropperImage.prototype, '$setTransform')
      .mockReturnThis()
    const transformEvent = new CustomEvent('transform', {
      cancelable: true,
      detail: { matrix: [1, 0, 0, 1, 1, -5] }
    })

    wrapper.get('cropper-image').element.dispatchEvent(transformEvent)
    expect(transformEvent.defaultPrevented).toBe(true)
    expect(setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, -5)
  })

  it('preserves animated GIF files', async () => {
    const toCanvas = vi.spyOn(CropperSelection.prototype, '$toCanvas')
    const onUpdate = vi.fn()
    const wrapper = mountImageUpload({
      modelValue: imageFile('image/gif'),
      'onUpdate:modelValue': onUpdate
    })

    await wrapper.get('cropper-canvas').trigger('actionend')

    expect(toCanvas).not.toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
