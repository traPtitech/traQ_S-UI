import type { ComponentPublicInstance, VNode } from 'vue'
import {
  Comment,
  Text,
  cloneVNode,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'

import { isIOS } from '/@/lib/dom/browser'
import { useModalStore } from '/@/store/ui/modal'

/**
 * コメントや文字列のVNodeを取り除く
 */
const filterChildren = <T extends VNode>(vnodes: T[]) =>
  vnodes.filter(vnode => {
    if (vnode.type === Text) return false
    if (vnode.type === Comment) return false
    if (typeof vnode.type === 'object' && '__isFragment' in vnode.type)
      return false
    return true
  })

const startEventName = isIOS() ? 'touchstart' : 'mousedown'
const endEventName = isIOS() ? 'touchend' : 'mouseup'

/**
 * そのデフォルトスロットに指定した要素の外でクリックされたときにclickOutsideイベントを発火する
 */
export default defineComponent({
  name: 'ClickOutside',
  props: {
    enabled: {
      type: Boolean,
      default(this: void) {
        return true
      }
    },
    stop: {
      type: Boolean,
      default(this: void) {
        return false
      }
    },
    unableWhileModalOpen: {
      type: Boolean,
      default(this: void) {
        return false
      }
    }
  },
  emits: {
    clickOutside: (_e: MouseEvent | TouchEvent) => true
  },
  setup(props, { slots, emit }) {
    const element = shallowRef<Element | ComponentPublicInstance>()

    const { shouldShowModal } = useModalStore()
    const isMouseDown = ref(false)
    let listening = false

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      if (!element.value) return

      if (props.unableWhileModalOpen && shouldShowModal.value) return

      const ele =
        element.value instanceof Element ? element.value : element.value.$el

      if (ele === e.target || e.composedPath().includes(ele)) {
        return
      }

      isMouseDown.value = true
      if (props.stop) {
        e.stopPropagation()
      }
    }
    const onMouseUp = (e: MouseEvent | TouchEvent) => {
      if (!isMouseDown.value) return
      isMouseDown.value = false

      if (!element.value) return
      const ele =
        element.value instanceof Element ? element.value : element.value.$el

      if (ele === e.target || e.composedPath().includes(ele)) {
        return
      }

      setTimeout(() => {
        emit('clickOutside', e)
      }, 0)

      if (props.stop) {
        e.stopPropagation()
      }
    }

    const addListeners = () => {
      if (listening) return
      window.addEventListener(startEventName, onMouseDown, { capture: true })
      window.addEventListener(endEventName, onMouseUp, { capture: true })
      listening = true
    }
    const removeListeners = () => {
      if (!listening) return
      window.removeEventListener(startEventName, onMouseDown, { capture: true })
      window.removeEventListener(endEventName, onMouseUp, { capture: true })
      listening = false
    }

    onMounted(() => {
      if (props.enabled) addListeners()
    })
    onBeforeUnmount(() => {
      removeListeners()
    })

    watch(
      () => props.enabled,
      enabled => {
        if (enabled) addListeners()
        else removeListeners()
      }
    )

    return () => {
      if (!slots['default']) {
        return null
      }

      const filtedChildren = filterChildren(slots['default']())
      if (filtedChildren.length > 1) {
        throw new Error(
          '<ClickOutside>のデフォルトスロットには一つの要素しか渡せません'
        )
      }
      if (!filtedChildren[0]) {
        // v-ifで非表示になっている場合はここに入る
        return null
      }

      const [firstChild] = filtedChildren
      return cloneVNode(firstChild, { ref: element }, true)
    }
  }
})
