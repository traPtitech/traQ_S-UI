import { computed, watch } from 'vue'

import { useQuery, useQueryClient } from '@tanstack/vue-query'

import useMittListener from '/@/composables/utils/useMittListener'
import apis from '/@/lib/apis'
import { wsListener } from '/@/lib/websocket'
import type { ChannelId } from '/@/types/entity-ids'

/**
 * 閲覧中のチャンネルでないとwsからのイベントが来ないため変化しないので注意
 */
const useChannelSubscribers = (props: { channelId: ChannelId }) => {
  const queryClient = useQueryClient()
  const queryKey = computed(
    () => ['channel-subscribers', props.channelId] as const
  )

  const request = useQuery({
    queryKey,

    queryFn: async ({ queryKey: [, channelId], signal }) =>
      (await apis.getChannelSubscribers(channelId, { signal })).data
  })

  watch(request.error, error => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  })

  const subscribers = computed(
    () => new Set(request.isError.value ? [] : request.data.value)
  )

  const refresh = async () => {
    const filters = {
      queryKey: queryKey.value,
      exact: true,
      type: 'active' as const
    }

    await queryClient.cancelQueries(filters)
    await queryClient.refetchQueries(filters, { cancelRefetch: false })
  }

  useMittListener(wsListener, 'CHANNEL_SUBSCRIBERS_CHANGED', ({ id }) => {
    if (id !== props.channelId) return

    void refresh()
  })

  useMittListener(wsListener, 'reconnect', () => {
    void refresh()
  })

  return subscribers
}

export default useChannelSubscribers
