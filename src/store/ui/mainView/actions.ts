import { defineActions } from 'direct-vuex'
import { moduleActionContext } from '/@/store'
import { mainView } from '.'
import {
  ClipFolderId,
  ChannelId,
  MessageId,
  DMChannelId
} from '/@/types/entity-ids'
import { ActionContext } from 'vuex'
import { channelIdToPathString } from '/@/lib/channel'

export const mainViewActionContext = (
  context: ActionContext<unknown, unknown>
) => moduleActionContext(context, mainView)

export const actions = defineActions({
  async changePrimaryViewToChannelOrDM(
    context,
    payload: { channelId: ChannelId | DMChannelId; entryMessageId?: MessageId }
  ) {
    const { rootState, rootDispatch, dispatch } = mainViewActionContext(context)
    const DMChannel = rootState.entities.dmChannelsMap.get(payload.channelId)
    if (DMChannel) {
      const user = await rootDispatch.entities.fetchUser({
        userId: DMChannel.userId,
        cacheStrategy: 'useCache'
      })
      if (!user) {
        throw 'user not found'
      }

      dispatch.changePrimaryViewToDM({
        ...payload,
        userName: user.name
      })
      return
    }
    dispatch.changePrimaryViewToChannel(payload)
  },
  changePrimaryViewToChannel(
    context,
    payload: { channelId: ChannelId; entryMessageId?: MessageId }
  ) {
    const { rootDispatch, commit, rootCommit, rootState } =
      mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'channel',
      channelId: payload.channelId,
      entryMessageId: payload.entryMessageId
    })
    rootDispatch.domain.messagesView.changeCurrentChannel(payload)

    // 通常のチャンネルは最後に開いたチャンネルとして保持
    const channelPath = channelIdToPathString(
      payload.channelId,
      rootState.entities.channelsMap
    )
    rootCommit.app.browserSettings.setLastOpenChannelName(channelPath)
  },
  changePrimaryViewToDM(
    context,
    payload: {
      channelId: DMChannelId
      userName: string
      entryMessageId?: MessageId
    }
  ) {
    const { rootDispatch, commit } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'dm',
      channelId: payload.channelId,
      userName: payload.userName,
      entryMessageId: payload.entryMessageId
    })
    rootDispatch.domain.messagesView.changeCurrentChannel({
      ...payload,
      isDM: true
    })
  },
  changePrimaryViewToClip(
    context,
    { clipFolderId }: { clipFolderId: ClipFolderId }
  ) {
    const { rootDispatch, commit } = mainViewActionContext(context)
    commit.setPrimaryView({
      type: 'clips',
      clipFolderId
    })
    rootDispatch.domain.messagesView.changeCurrentClipFolder(clipFolderId)
  }
})
