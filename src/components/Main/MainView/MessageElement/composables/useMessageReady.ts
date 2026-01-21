import { type InjectionKey, inject, provide, ref } from 'vue'

const messageReadyKey = Symbol('messageReady') as InjectionKey<
  (p: Promise<unknown>) => void
>

export const provideMessageReady = () => {
  const promises = ref<Promise<unknown>[]>([])
  const register = (p: Promise<unknown>) => {
    promises.value.push(p)
  }
  provide(messageReadyKey, register)
  return {
    waitAll: async () => {
      await Promise.all(promises.value)
    }
  }
}

export const useMessageReady = () => {
  const register = inject(messageReadyKey, null)
  return { register }
}
