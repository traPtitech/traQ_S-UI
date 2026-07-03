import type { ComponentPublicInstance, VNode } from 'vue'
import {
  Comment,
  Text,
  cloneVNode,
  computed,
  defineComponent,
  ref,
  shallowRef
} from 'vue'

import { useEventListener } from '@vueuse/core'

import { unrefElement } from '/@/lib/dom/unrefElement'
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
    clickOutside: (_e: PointerEvent) => true
  },
  setup(props, { slots, emit }) {
    const element = shallowRef<HTMLElement | ComponentPublicInstance>()

    const { shouldShowModal } = useModalStore()
    const isPointerDownOutside = ref(false)
    const pointerDownPosition = ref<{ x: number; y: number } | null>(null)

    const resetPointerDown = () => {
      isPointerDownOutside.value = false
      pointerDownPosition.value = null
    }

    const isInside = (e: PointerEvent) => {
      const ele = unrefElement(element)
      return ele === e.target || e.composedPath().includes(ele)
    }

    const onPointerDown = (e: PointerEvent) => {
      resetPointerDown()

      if (!element.value) return

      if (props.unableWhileModalOpen && shouldShowModal.value) return

      if (isInside(e)) {
        return
      }

      isPointerDownOutside.value = true
      pointerDownPosition.value = { x: e.clientX, y: e.clientY }
      if (props.stop) {
        e.stopPropagation()
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownOutside.value || !pointerDownPosition.value) return

      if (
        e.clientX === pointerDownPosition.value.x &&
        e.clientY === pointerDownPosition.value.y
      ) {
        return
      }

      resetPointerDown()

      setTimeout(() => {
        emit('clickOutside', e)
      }, 0)

      if (props.stop) {
        e.stopPropagation()
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDownOutside.value) return

      resetPointerDown()

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
    useEventListener(target, 'pointermove', onPointerMove, listenerOptions)
    useEventListener(target, 'pointerup', onPointerUp, listenerOptions)
    useEventListener(target, 'pointercancel', resetPointerDown, listenerOptions)

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
