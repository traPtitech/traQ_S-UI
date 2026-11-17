import { ThumbnailType } from '@traptitech/traq'

import { computed } from 'vue'

import { buildFileWaveformPath } from '/@/lib/apis'

import useFileMeta from './useFileMeta'

const useFileWaveform = (props: { fileId: string }) => {
  const { fileMeta, fileLink } = useFileMeta(props)
  const fileWaveform = computed(() =>
    fileMeta.value?.thumbnails.find(t => t.type === ThumbnailType.Waveform)
  )

  const name = computed(() => fileMeta.value?.name ?? '')
  const fileWaveformPath = computed(() => {
    if (!fileMeta.value || !fileWaveform.value) return

    const path = buildFileWaveformPath(fileMeta.value.id)
    const { width = 0, height = 0 } = fileWaveform.value
    if (width <= 0 || height <= 0) return path

    // WebKit でも SVG マスクが再生欄の幅に合わせて伸縮するようにする。
    return `${path}#svgView(viewBox(0,0,${width},${height});preserveAspectRatio(none))`
  })

  return {
    name,
    fileLink,
    fileWaveformPath
  }
}

export default useFileWaveform
