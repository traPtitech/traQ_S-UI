import useCopyText from '/@/composables/toast/useCopyText'
import useChannelPath from '/@/composables/useChannelPath'
import { embeddingOrigin } from '/@/lib/apis'
import type { ChannelId } from '/@/types/entity-ids'

const useCopyThreadLink = (props: { channelId: ChannelId }) => {
  const { copyText } = useCopyText()
  const { channelIdToPathString, channelIdToLink } = useChannelPath()

  const copyLink = async () => {
    const channelPath = channelIdToPathString(props.channelId)
    const channelLink = channelIdToLink(props.channelId)
    if (!channelPath || !channelLink) return
    const channelUrl = `${embeddingOrigin}${channelLink}`

    await copyText(`[#${channelPath}](${channelUrl})`, 'チャンネルリンク')
  }

  return { copyLink }
}

export default useCopyThreadLink
