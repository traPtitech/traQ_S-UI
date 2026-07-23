import type { ComponentPublicInstance, VNode } from 'vue'
import {
  Comment,
  Text,
  cloneVNode,
  computed,
  defineComponent,
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
 * そのデフォルトスロットに指定した要素の外でポインターが動いたかクリックが離されたときにclickOutsideイベントを発火する
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
    type PointerState = Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY'>
    let pointerDown: PointerState | undefined

    const resetPointerDown = () => {
      pointerDown = undefined
    }

    const emitClickOutside = (e: PointerEvent) => {
      resetPointerDown()

      setTimeout(() => emit('clickOutside', e), 0)

      if (props.stop) e.stopPropagation()
    }

    const isInside = (e: PointerEvent) => {
      const ele = unrefElement(element)
      return ele === e.target || e.composedPath().includes(ele)
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!element.value) return
      if (props.unableWhileModalOpen && shouldShowModal.value) return
      if (isInside(e)) return

      pointerDown = {
        pointerId: e.pointerId,
        clientX: e.clientX,
        clientY: e.clientY
      }

      if (props.stop) e.stopPropagation()
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return
      if (pointerDown.pointerId !== e.pointerId) return

      if (e.buttons === 0) {
        resetPointerDown()
        return
      }

      if (
        e.clientX === pointerDown.clientX &&
        e.clientY === pointerDown.clientY
      ) {
        return
      }

      emitClickOutside(e)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerDown) return
      if (pointerDown.pointerId !== e.pointerId) return

      emitClickOutside(e)
    }

    const onPointerCancel = (e: PointerEvent) => {
      if (!pointerDown) return
      if (pointerDown.pointerId !== e.pointerId) return

      resetPointerDown()
    }

    const target = computed(() => (props.enabled ? window : null))
    const listenerOptions = { capture: true }

    useEventListener(target, 'pointerdown', onPointerDown, listenerOptions)
    useEventListener(target, 'pointermove', onPointerMove, listenerOptions)
    useEventListener(target, 'pointerup', onPointerUp, listenerOptions)
    useEventListener(target, 'pointercancel', onPointerCancel, listenerOptions)

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
