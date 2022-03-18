import { Ref, watchEffect } from 'vue'

const useHtmlDatasetBoolean = (datasetName: string, value: Ref<boolean>) => {
  const $html = document.documentElement
  if (value.value) {
    $html.dataset[datasetName] = ''
  }

  watchEffect(() => {
    const attrOn = $html.dataset[datasetName] === ''
    if (attrOn !== value.value) {
      if (value.value) {
        $html.dataset[datasetName] = ''
      } else {
        delete $html.dataset[datasetName]
      }
    }
  })
}

export default useHtmlDatasetBoolean
