import { ref } from '@vue/composition-api'

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
