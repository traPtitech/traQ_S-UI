import { computed } from 'vue'
import { buildFileWaveformPath } from '@/lib/apis'
import useFileMeta from './fileMeta'
import { ThumbnailType } from '@traptitech/traq'

const useFileWaveform = (props: { fileId: string }) => {
  const { fileMeta, fileLink, fileRawPath } = useFileMeta(props)
  const fileWaveform = computed(() =>
    fileMeta.value?.thumbnails.find(t => t.type === ThumbnailType.Waveform)
  )

  const name = computed(() => fileMeta.value?.name ?? '')
  const fileWaveformPath = computed(() =>
    fileMeta.value && fileWaveform.value
      ? buildFileWaveformPath(fileMeta.value.id)
      : undefined
  )
  const fileWaveformSize = computed(() => ({
    height: fileWaveform.value?.height,
    width: fileWaveform.value?.width
  }))
  return {
    name,
    fileLink,
    fileWaveformPath,
    fileWaveformSize
  }
}

export default useFileWaveform
