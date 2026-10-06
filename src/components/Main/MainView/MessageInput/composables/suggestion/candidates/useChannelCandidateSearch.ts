import useChannelPath from '/@/composables/useChannelPath'
import { isDefined } from '/@/lib/basic/array'
import { useChannelsStore } from '/@/store/entities/channels'

import useCandidateSearch from './useCandidateSearch'

const useChannelCandidateSearch = () => {
  const { channelsMap } = useChannelsStore()
  const { channelIdToPathString } = useChannelPath()

  return useCandidateSearch(
    () =>
      [...channelsMap.value.values()]
        .map(channel => {
          const path = channelIdToPathString(channel.id, true)
          if (!path) return undefined
          return {
            type: 'channel',
            text: path,
            id: channel.id,
            delimiter: '/'
          } as const
        })
        .filter(isDefined),
    ['addChannel', 'setChannels', 'updateChannel']
  )
}

export default useChannelCandidateSearch
