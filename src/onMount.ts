import { mitt } from '@/lib/typedMitt'

export const mountMitt = mitt<{ mount: () => void }>()

export const waitMount = new Promise<void>(resolve => {
  const onMount = () => {
    resolve()
    mountMitt.off('mount', onMount)
  }
  mountMitt.on('mount', onMount)
})
