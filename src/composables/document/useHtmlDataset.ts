import type { Ref } from 'vue'
import { watchEffect } from 'vue'

const useHtmlDataset = (datasetName: string, value: Ref<string | boolean>) => {
  const $html = document.documentElement
  watchEffect(() => {
    $html.dataset[datasetName] = '' + value.value
  })
}

export default useHtmlDataset
