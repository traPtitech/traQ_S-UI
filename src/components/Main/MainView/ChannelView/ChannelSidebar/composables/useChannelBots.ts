import { ref, watchEffect } from 'vue'

import apis from '/@/lib/apis'
import type { ChannelId } from '/@/types/entity-ids'

const useChannelBots = (props: { channelId: ChannelId }) => {
  const botUserIds = ref<string[] | undefined>()

  const fetch = async () => {
    try {
      const res = await apis.getChannelBots(props.channelId)
      botUserIds.value = res.data.map(botUser => botUser.botUserId)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      botUserIds.value = undefined
    }
  }

  // 表示されたまたはチャンネルが変わったとき
  watchEffect(() => {
    fetch()
  })

  return botUserIds
}

export default useChannelBots
