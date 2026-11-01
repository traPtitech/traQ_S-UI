import useCopyText from '/@/composables/toast/useCopyText'
import useCachedChannelPath from '/@/composables/useCachedChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import { constructChannelPath } from '/@/router'
import type { ChannelId } from '/@/types/entity-ids'

const useCopyChannelLink = (props: { channelId: ChannelId }) => {
  const { copyText } = useCopyText()
  const { channelIdToPathString } = useCachedChannelPath()

  const copyLink = async () => {
    const channelPath = channelIdToPathString(props.channelId) as string
    const channelUrl = `${embeddingOrigin}${constructChannelPath(channelPath)}`

    await copyText(`[#${channelPath}](${channelUrl})`, 'チャンネルリンク')
  }

  return { copyLink }
}

export default useCopyChannelLink
