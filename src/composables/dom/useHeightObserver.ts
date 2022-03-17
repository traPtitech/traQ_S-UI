import { onBeforeUnmount, onMounted, ref, ShallowRef } from 'vue'

const useHeightObserver = (targetRef: ShallowRef<HTMLElement | null>) => {
  const height = ref<number>()

  const observer = new ResizeObserver(entries => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const entry = entries[0]!
    const { height: h } = entry.target.getBoundingClientRect()
    height.value = h
  })

  onMounted(() => {
    if (targetRef.value) {
      observer.observe(targetRef.value)
    }
  })
  onBeforeUnmount(() => {
    if (targetRef.value) {
      observer.unobserve(targetRef.value)
    }
  })

  return { height }
}

export default useHeightObserver
