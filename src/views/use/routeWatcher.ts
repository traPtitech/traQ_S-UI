import { SetupContext, computed, reactive, watch } from '@vue/composition-api'
import store, { originalStore } from '@/store'
import { RouteName, constructChannelPath } from '@/router'
import useNavigationController from '@/use/navigationController'
import useChannelPath from '@/use/channelPath'
import useViewTitle from './viewTitle'
import apis from '@/lib/apis'
import { ChannelId, DMChannelId } from '@/types/entity-ids'

type Views = 'none' | 'main' | 'not-found'

const setUnreadState = (id: ChannelId | DMChannelId) => {
  // 未読の処理
  // TODO: 新着メッセージ基準設定などの処理
  store.commit.domain.messagesView.unsetUnreadSince()
  const unreadChannel = store.state.domain.me.unreadChannelsSet[id]
  if (unreadChannel) {
    if (
      store.state.domain.me.subscriptionMap[id] > 0 ||
      store.state.entities.dmChannels[id]
    ) {
      store.commit.domain.messagesView.setUnreadSince(unreadChannel.since)
    }

    store.dispatch.domain.me.readChannel({ channelId: id })
  }
}

const useRouteWacher = (context: SetupContext) => {
  const { channelPathToId, channelIdToPathString } = useChannelPath()
  const { changeViewTitle } = useViewTitle()
  const { closeNav } = useNavigationController()

  const state = reactive({
    currentRouteName: computed(() => context.root.$route.name ?? ''),
    currentRouteParam: computed(
      (): string => state.idParam ?? state.channelParam ?? state.userParam ?? ''
    ),
    idParam: computed(() => context.root.$route.params['id']),
    channelParam: computed(() => context.root.$route.params['channel']),
    userParam: computed(() => context.root.$route.params['user']),
    view: 'none' as Views,
    isInitialView: true
  })

  const useOpenChannel = async () => {
    await originalStore.restored
    return computed(() => store.getters.app.browserSettings.defaultChannelName)
  }
  const onRouteChangedToIndex = async () => {
    try {
      await store.dispatch.domain.me.fetchMe()
    } catch {
      return
    }

    const openChannelPath = await useOpenChannel()
    await context.root.$router
      .replace(constructChannelPath(openChannelPath.value))
      // 同じ場所に移動しようとした際のエラーを消す
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
    return
  }

  const onRouteChangedToChannel = () => {
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }
    try {
      const id = channelPathToId(
        state.channelParam.split('/'),
        store.state.domain.channelTree.channelTree
      )

      setUnreadState(id)

      store.dispatch.ui.mainView.changePrimaryViewToChannel({
        channelId: id,
        entryMessageId: context.root.$route.query?.message as string
      })
    } catch (e) {
      state.view = 'not-found'
      return
    }
    const id = channelPathToId(
      state.channelParam.split('/'),
      store.state.domain.channelTree.channelTree
    )
    const useShortenedPath = (props: any) => {
      const { channelIdToShortPathString } = useChannelPath()
      return channelIdToShortPathString(id)
    }
    changeViewTitle(`#${useShortenedPath(state.channelParam)}`)
    state.view = 'main'
  }

  const onRouteChangedToUser = async () => {
    const user = store.getters.entities.userByName(state.currentRouteParam)
    try {
      if (!user) throw 'user not found'

      let dmChannelId = store.getters.entities.DMChannelIdByUserId(user.id)

      if (!dmChannelId) {
        const { data } = await apis.getUserDMChannel(user.id)
        store.commit.entities.addDMChannel({
          id: data.id,
          entity: data
        })
        dmChannelId = data.id
      }
      if (!dmChannelId) throw 'failed to fetch DM channel ID'

      setUnreadState(dmChannelId)

      store.dispatch.ui.mainView.changePrimaryViewToDM({
        channelId: dmChannelId,
        userName: user.name,
        entryMessageId: context.root.$route.query?.message as string
      })
      changeViewTitle('@' + user.name)
      state.view = 'main'
    } catch {
      state.view = 'not-found'
      return
    }
  }

  const onRouteChangedToClipFolders = async () => {
    const id = state.idParam
    try {
      const clipFolder =
        store.state.entities.clipFolders[id] ??
        (await store.dispatch.entities.fetchClipFolder(id))
      changeViewTitle(clipFolder.name)
    } catch {
      state.view = 'not-found'
      return
    }
    store.dispatch.ui.mainView.changePrimaryViewToClip({ clipFolderId: id })
    state.view = 'main'
  }

  const onRouteChangedToFile = async () => {
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }
    const fileId = state.idParam
    if (!store.state.entities.fileMetaData[fileId]) {
      await store.dispatch.entities.fetchFileMetaByFileId(fileId)
    }
    const file = store.state.entities.fileMetaData[fileId]

    if (!file) {
      // ファイルがなかった
      state.view = 'not-found'
      return
    }

    const openChannelPath = await useOpenChannel()
    let channelPath = ''
    let channelId = ''
    if (file.channelId) {
      channelPath = channelIdToPathString(file.channelId, true)
      channelId = file.channelId
    } else {
      channelPath = openChannelPath.value
      try {
        channelId = channelPathToId(
          channelPath.split('/'),
          store.state.domain.channelTree.channelTree
        )
      } catch (e) {
        state.view = 'not-found'
        return
      }
    }

    store.dispatch.ui.mainView.changePrimaryViewToChannelOrDM({
      channelId: channelId
    })
    const modalPayload = {
      type: 'file' as const,
      id: fileId,
      relatedRoute: RouteName.File as const
    }
    store.dispatch.ui.modal.replaceModal(modalPayload)
    changeViewTitle(`${channelPath} - ${file.name}`)
    state.view = 'main'
  }

  const onRouteChangedToMessage = async () => {
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      return
    }
    const messageId = state.idParam
    const message =
      store.state.entities.messages[messageId] ??
      (await store.dispatch.entities.fetchMessage(messageId))
    if (!message?.channelId) {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    const channelId = message.channelId

    if (channelId in store.state.entities.channels) {
      context.root.$router.replace({
        name: RouteName.Channel,
        params: { channel: channelIdToPathString(message.channelId) },
        query: { message: message.id }
      })
    } else if (channelId in store.state.entities.dmChannels) {
      const dmChannel = store.state.entities.dmChannels[channelId]
      const user = store.state.entities.users[dmChannel.userId]
      context.root.$router.replace({
        name: RouteName.User,
        params: { user: user?.name ?? '' },
        query: { message: message.id }
      })
    } else {
      // チャンネルがなかった
      state.view = 'not-found'
    }
  }

  const onRouteParamChange = async (
    routeParam: string,
    prevRouteParam: string
  ) => {
    store.commit.ui.modal.setIsOnInitialModalRoute(false)
    const routeName = state.currentRouteName
    if (routeName === RouteName.Index) {
      await onRouteChangedToIndex()
      return
    }
    if (
      !store.state.app.initialFetchCompleted ||
      routeParam === prevRouteParam
    ) {
      return
    }
    if (routeName === RouteName.Channel) {
      onRouteChangedToChannel()
    } else if (routeName === RouteName.User) {
      onRouteChangedToUser()
    } else if (routeName === RouteName.ClipFolders) {
      onRouteChangedToClipFolders()
    } else if (routeName === RouteName.File) {
      await onRouteChangedToFile()
    } else if (routeName === RouteName.Message) {
      await onRouteChangedToMessage()
    }
    // ファイルURLを踏むなどして、アクセス時点のURLでモーダルを表示する場合
    const isOnInitialModalRoute =
      state.isInitialView &&
      history.state?.modalState &&
      !!history.state?.modalState[0]?.relatedRoute
    store.commit.ui.modal.setIsOnInitialModalRoute(isOnInitialModalRoute)

    if (state.isInitialView && !isOnInitialModalRoute) {
      // 初回表示かつモーダルを表示する必要がない状態なので、stateをクリア
      if (store.state.ui.modal.modalState.length !== 0) {
        store.commit.ui.modal.setState([])
      }
      history.replaceState(null, '')
    }

    state.isInitialView = false
    closeNav()
  }

  const routeWatcher = watch(
    computed(() =>
      store.state.app.initialFetchCompleted ? state.currentRouteParam : ''
    ),
    onRouteParamChange
  )
  onRouteParamChange(state.channelParam, '')

  return {
    routeWatcherState: state,
    routeWatcher,
    onRouteChangedToIndex,
    onRouteChangedToChannel,
    onRouteChangedToFile
  }
}

export default useRouteWacher
