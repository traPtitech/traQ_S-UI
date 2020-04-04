import { computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { isImage, isNonPreviewable, isVideo } from '@/lib/util/file'

const useFileMetaList = (props: { fileIds: string[] }) => {
  const fileMetaData = computed(() =>
    props.fileIds.map(id => store.state.entities.fileMetaData[id])
  )
  const state = reactive({
    images: computed(() =>
      fileMetaData.value.filter(meta => isImage(meta.mime))
    ),
    videos: computed(() =>
      fileMetaData.value.filter(meta => isVideo(meta.mime))
    ),
    files: computed(() =>
      fileMetaData.value.filter(meta => isNonPreviewable(meta.mime))
    )
  })
  return { fileMetaDataState: state }
}

export default useFileMetaList
