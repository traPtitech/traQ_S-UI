import type { Ref } from 'vue'
import { nextTick, onMounted } from 'vue'

type Callback = () => void | Promise<void>

const useOnAllRendered = <T extends string>(list: Ref<T[]>) => {
  const callbacks: Callback[] = []

  let all: Set<T> | undefined
  onMounted(() => {
    all = new Set(list.value)
  })

  const onAllRendered = (callback: Callback) => {
    callbacks.push(callback)
  }

  const didRender = async (key: T) => {
    if (!all) return

    all.delete(key)
    if (all.size === 0) {
      await nextTick()
      for (const callback of callbacks) {
        callback()
      }
      callbacks.splice(0, callbacks.length)
    }
  }

  return { didRender, onAllRendered }
}

export default useOnAllRendered
