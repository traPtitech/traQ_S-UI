/* eslint-disable vue/one-component-per-file -- 表示条件の継承を複数階層で検証するため */
import { defineComponent, h, nextTick, ref, toRef } from 'vue'

import { enableAutoUnmount, mount } from '@vue/test-utils'

import {
  provideNavigationVisibility,
  useNavigationVisibility
} from '/@/components/Main/NavigationBar/composables/useNavigationVisibility'

enableAutoUnmount(afterEach)

const Consumer = defineComponent({
  setup() {
    const isVisible = useNavigationVisibility()

    return () => h('span', String(isVisible.value))
  }
})

const Provider = defineComponent({
  props: { isVisible: { type: Boolean, default: true } },
  setup(props, { slots }) {
    provideNavigationVisibility(toRef(props, 'isVisible'))

    return () => slots['default']?.()
  }
})

describe('useNavigationVisibility', () => {
  it('提供元がなければ表示中として扱う', () => {
    const wrapper = mount(Consumer)

    expect(wrapper.text()).toBe('true')
  })

  it('親と子の表示条件を合成し、各階層の変更に追従する', async () => {
    const parentVisible = ref(true)
    const childVisible = ref(true)

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Provider,
              { isVisible: parentVisible.value },
              {
                default: () => [
                  h(Consumer, { id: 'parent' }),
                  h(
                    Provider,
                    { isVisible: childVisible.value },
                    {
                      default: () => h(Consumer, { id: 'child' })
                    }
                  )
                ]
              }
            )
        }
      })
    )

    expect(wrapper.get('#parent').text()).toBe('true')
    expect(wrapper.get('#child').text()).toBe('true')

    childVisible.value = false
    await nextTick()

    expect(wrapper.get('#parent').text()).toBe('true')
    expect(wrapper.get('#child').text()).toBe('false')

    parentVisible.value = false
    childVisible.value = true
    await nextTick()

    expect(wrapper.get('#parent').text()).toBe('false')
    expect(wrapper.get('#child').text()).toBe('false')

    parentVisible.value = true
    await nextTick()

    expect(wrapper.get('#parent').text()).toBe('true')
    expect(wrapper.get('#child').text()).toBe('true')
  })
})
