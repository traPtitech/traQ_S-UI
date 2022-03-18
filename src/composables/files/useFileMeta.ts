import { computed } from 'vue'
import { buildFilePath } from '/@/lib/apis'
import { mimeToFileType, prettifyFileSize } from '/@/lib/basic/file'
import useFileLink from './useFileLink'
import { ChannelId, FileId } from '/@/types/entity-ids'
import { useMessagesStore } from '/@/store/entities/messages'
import { useChannelsStore } from '/@/store/entities/channels'

const useFileMeta = (props: {
  fileId: FileId
  /** 表示しているチャンネル */
  channelId?: ChannelId
}) => {
  const { fileMetaDataMap } = useMessagesStore()
  const { dmChannelsMap } = useChannelsStore()

  const fileMeta = computed(() => fileMetaDataMap.value.get(props.fileId))
  const { fileLink, onFileDownloadLinkClick } = useFileLink(props)
  const fileRawPath = computed(() =>
    fileMeta.value ? buildFilePath(fileMeta.value.id) : ''
  )
  const fileType = computed(() =>
    fileMeta.value ? mimeToFileType(fileMeta.value.mime) : 'file'
  )
  const isAnimatedImage = computed(
    () => fileMeta.value?.isAnimatedImage ?? false
  )
  const fileSize = computed(() =>
    fileMeta.value ? prettifyFileSize(fileMeta.value.size) : '0B'
  )
  const canShow = computed(() => {
    const fileChannel = fileMeta.value?.channelId
    // DMのメッセージは同じDMチャンネルから表示されてる場合だけ表示する
    return fileChannel
      ? !dmChannelsMap.value.has(fileChannel) || fileChannel === props.channelId
      : true
  })
  return {
    fileMeta,
    fileLink,
    fileRawPath,
    fileType,
    isAnimatedImage,
    fileSize,
    canShow,
    onFileDownloadLinkClick
  }
}

export default useFileMeta
