import { ref } from 'vue'

const defaultText = 'スタンプを検索'

const useStampFilterPlaceholder = () => {
  const placeholder = ref(defaultText)
  const onHoverStamp = (name?: string) => {
    placeholder.value = name ?? defaultText
  }
  return {
    placeholder,
    onHoverStamp
  }
}

export default useStampFilterPlaceholder
