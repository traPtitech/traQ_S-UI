import type { ComponentPublicInstance, VNode } from 'vue'
import {
  cloneVNode,
  Comment,
  computed,
  defineComponent,
  ref,
  shallowRef,
  Text
} from 'vue'
import { useModalStore } from '/@/store/ui/modal'
import useEventListener from '/@/composables/dom/useEventListener'

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

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
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

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
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

    const target = computed(() => (props.enabled ? window : null))
    const listenerOptions = { capture: true }

    useEventListener(target, 'pointerdown', onPointerDown, listenerOptions)
    useEventListener(target, 'pointerup', onPointerUp, listenerOptions)

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
