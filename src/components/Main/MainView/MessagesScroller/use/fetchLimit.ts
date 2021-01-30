import { onMounted, Ref, ref } from 'vue'

const useFetchLimit = (
  scrollerEle: Ref<{ $el: HTMLDivElement } | undefined>,
  messageHeight: number
) => {
  const fetchLimit = ref(0)
  onMounted(() => {
    fetchLimit.value = Math.ceil(
      (scrollerEle.value?.$el.clientHeight ?? 0) / messageHeight
    )
  })

  const waitMounted = new Promise<void>(resolve => {
    onMounted(() => {
      resolve()
    })
  })

  return { fetchLimit, waitMounted }
}

export default useFetchLimit
