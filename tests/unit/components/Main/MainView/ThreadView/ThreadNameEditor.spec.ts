import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'

import boolAttr from '/@/bool-attr'
import ThreadNameEditor from '/@/components/Main/MainView/ThreadView/ThreadNameEditor.vue'

enableAutoUnmount(afterEach)

const mountEditor = () =>
  mount(ThreadNameEditor, {
    props: {
      currentName: '現在の名前',
      modelValue: '編集中の名前',
      isEditing: false,
      isSaving: false,
      errorMessage: null
    },
    global: { plugins: [boolAttr] },
    attachTo: document.body
  })

describe('ThreadNameEditor', () => {
  it('shows the current name and requests editing without changing parent state', async () => {
    const wrapper = mountEditor()
    expect(wrapper.text()).toContain('現在の名前')
    expect(wrapper.text()).not.toContain('編集中の名前')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('edit')).toEqual([[]])
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('focuses externally opened input, emits the unchanged value, and waits for the parent to close', async () => {
    const wrapper = mountEditor()
    await wrapper.setProps({ isEditing: true })
    await flushPromises()
    const input = wrapper.get('textarea')
    expect(document.activeElement).toBe(input.element)
    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))

    const name = '  日本語 #名前😀\n次の行  '
    await input.setValue(name)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([name])
    await wrapper.setProps({ modelValue: name })
    await wrapper.get('button[aria-label="保存"]').trigger('click')
    expect(wrapper.emitted('save')).toEqual([[name]])
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('prevents save and cancel while saving without discarding the draft', async () => {
    const wrapper = mountEditor()
    await wrapper.setProps({ isEditing: true, isSaving: true })
    expect(wrapper.get('textarea').element.readOnly).toBe(true)
    expect(wrapper.get('[role="status"]').text()).toBe('保存中…')
    for (const button of wrapper.findAll('button')) {
      expect(button.element.disabled).toBe(true)
      await button.trigger('click')
    }
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(wrapper.get('textarea').element.value).toBe('編集中の名前')
  })

  it('keeps the draft through a failed save and remote changes, describes the error, and allows retry', async () => {
    const wrapper = mountEditor()
    await wrapper.setProps({ isEditing: true, isSaving: true })
    await wrapper.setProps({
      currentName: '別の人が変更した名前',
      isSaving: false,
      errorMessage: '保存に失敗しました'
    })
    await flushPromises()
    const input = wrapper.get('textarea')
    expect(input.element.value).toBe('編集中の名前')
    expect(document.activeElement).toBe(input.element)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(
      wrapper.get('[role="alert"]').attributes('id')
    )
    expect(wrapper.get('[role="alert"]').text()).toBe('保存に失敗しました')
    await wrapper.get('button[aria-label="保存"]').trigger('click')
    expect(wrapper.emitted('save')).toEqual([['編集中の名前']])
  })

  it('emits cancel without saving or clearing input and restores focus when the parent closes', async () => {
    const wrapper = mountEditor()
    await wrapper.setProps({ isEditing: true })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('cancel')).toEqual([[]])
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.get('textarea').element.value).toBe('編集中の名前')
    await wrapper.setProps({ isEditing: false })
    await flushPromises()
    expect(document.activeElement).toBe(wrapper.get('button').element)
  })
})
