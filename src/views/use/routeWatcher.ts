import { SetupContext, computed, reactive, watch } from '@vue/composition-api'
import store from '@/store'
import { RouteName } from '@/router'
import useChannelPath from '@/use/channelPath'
import useViewTitle from './viewTitle'

type Views = 'none' | 'main' | 'not-found'

const useRouteWacher = (context: SetupContext) => {
  const { channelPathToId, channelIdToPath } = useChannelPath()
  const { changeViewTitle } = useViewTitle()

  const state = reactive({
    currentRouteName: computed(() => context.root.$route.name ?? ''),
    currentRouteParam: computed(
      (): string => state.idParam ?? state.channelParam ?? ''
    ),
    idParam: computed(() => context.root.$route.params['id']),
    channelParam: computed(() => context.root.$route.params['channel']),
    messageQuery: computed(() =>
      context.root.$route.query['message'] instanceof Array
        ? ''
        : context.root.$route.query['message']
    ),
    view: 'none' as Views,
    isInitialView: true
  })

  const onRouteChangedToIndex = async () => {
    await (store.original as any).restored
    context.root.$router.replace({
      name: RouteName.Channel,
      params: { channel: store.state.app.browserSettings.openChannelName }
    })
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
      store.dispatch.domain.messagesView.changeCurrentChannel({
        channelId: id,
        entryMessageId: state.messageQuery
      })
    } catch (e) {
      state.view = 'not-found'
      return
    }
    changeViewTitle(`#${state.channelParam}`)
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

    if (!file?.channelId) {
      // ファイルに関連づいたチャンネルIDがなかった
      state.view = 'not-found'
      return
    }
    const channelPath = channelIdToPath(file.channelId)
    store.dispatch.domain.messagesView.changeCurrentChannel({
      channelId: file.channelId
    })
    const modalPayload = {
      type: 'file' as const,
      id: fileId,
      relatedRoute: RouteName.File as const
    }
    store.dispatch.ui.modal.replaceModal(modalPayload)
    changeViewTitle(`#${channelPath} - ${file.name}`)
    state.view = 'main'
  }
  const onRouteChangedToMessage = async () => {
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      return
    }
    const { channelIdToPath } = useChannelPath()
    const messageId = state.idParam
    const message =
      store.state.entities.messages[messageId] ??
      (await store.dispatch.entities.fetchMessage(messageId))
    if (!message?.channelId) {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    context.root.$router.replace({
      name: RouteName.Channel,
      params: { channel: channelIdToPath(message.channelId).join('/') },
      query: { message: message.id }
    })
  }

  const onRouteParamChange = async (_: string, __: string) => {
    store.commit.ui.modal.setIsOnInitialModalRoute(false)
    const routeName = state.currentRouteName
    if (routeName === RouteName.Index) {
      await onRouteChangedToIndex()
    } else if (routeName === RouteName.Channel) {
      onRouteChangedToChannel()
    } else if (routeName === RouteName.File) {
      await onRouteChangedToFile()
    } else if (routeName === RouteName.Message) {
      await onRouteChangedToMessage()
    }
    // ファイルURLを踏むなどして、アクセス時点のURLでモーダルを表示する場合
    const isOnInitialModalRoute =
      state.isInitialView &&
      history.state?.modalState &&
      !!history.state?.modalState[0].relatedRoute
    store.commit.ui.modal.setIsOnInitialModalRoute(isOnInitialModalRoute)

    if (state.isInitialView && !isOnInitialModalRoute) {
      // 初回表示かつモーダルを表示する必要がない状態なので、stateをクリア
      if (store.state.ui.modal.modalState.length !== 0) {
        store.commit.ui.modal.setState([])
      }
      history.replaceState(null, '')
    }

    state.isInitialView = false
  }

  const onMessageQueryChange = () => {
    onRouteChangedToChannel()
  }

  const routeWatcher = watch(
    computed(() =>
      store.state.app.initialFetchCompleted ? state.currentRouteParam : ''
    ),
    onRouteParamChange
  )
  const messageQueryWatcher = watch(
    () => state.messageQuery,
    onMessageQueryChange
  )
  onRouteParamChange(state.channelParam, '')

  return {
    routeWatcherState: state,
    routeWatcher,
    messageQueryWatcher,
    onRouteChangedToIndex,
    onRouteChangedToChannel,
    onRouteChangedToFile
  }
}

export default useRouteWacher
