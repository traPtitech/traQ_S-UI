import mitt from 'mitt'

export const mountMitt = mitt<{ mount: void }>()

/**
 * Vueが初期化されるのを待つ
 */
export const waitMount = new Promise<void>(resolve => {
  const onMount = () => {
    resolve()
    mountMitt.off('mount', onMount)
  }
  mountMitt.on('mount', onMount)
})
