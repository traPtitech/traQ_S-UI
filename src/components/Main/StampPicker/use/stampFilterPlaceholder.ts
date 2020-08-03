import { ref } from 'vue'

const useStampFilterPlaceholder = () => {
  const placeholder = ref('スタンプを検索')
  const onHoverStamp = (name: string) => {
    placeholder.value = name
  }
  return {
    placeholder,
    onHoverStamp
  }
}

export default useStampFilterPlaceholder
