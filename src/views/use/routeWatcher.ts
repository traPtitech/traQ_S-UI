import { computed, reactive, watch } from 'vue'
import _store, { originalStore } from '@/_store'
import store from '@/store'
import router, { RouteName, constructChannelPath } from '@/router'
import useNavigationController from '@/use/navigationController'
import useChannelPath from '@/use/channelPath'
import useViewTitle from './viewTitle'
import apis from '@/lib/apis'
import { ChannelId, DMChannelId } from '@/types/entity-ids'
import { useRoute } from 'vue-router'
import { usersMapInitialFetchPromise } from '@/store/entities/promises'

type Views = 'none' | 'main' | 'not-found'

const setUnreadState = (id: ChannelId | DMChannelId) => {
  // 未読の処理
  // TODO: 新着メッセージ基準設定などの処理
  _store.commit.domain.messagesView.unsetUnreadSince()
  const unreadChannel = _store.state.domain.me.unreadChannelsSet[id]
  if (unreadChannel) {
    if (
      _store.state.domain.me.subscriptionMap[id] > 0 ||
      _store.state.entities.dmChannels[id]
    ) {
      _store.commit.domain.messagesView.setUnreadSince(unreadChannel.since)
    }

    _store.dispatch.domain.me.readChannel({ channelId: id })
  }
}

const getHeadIfArray = (param: string[] | string) => {
  if (Array.isArray(param)) return param[0]
  return param
}

const useRouteWatcher = () => {
  const route = useRoute()
  const { channelPathToId, channelIdToPathString } = useChannelPath()
  const { changeViewTitle } = useViewTitle()
  const { closeNav } = useNavigationController()

  const state = reactive({
    currentRouteName: computed(() => route.name ?? ''),
    currentRouteParam: computed(
      (): string => state.idParam ?? state.channelParam ?? state.userParam ?? ''
    ),
    idParam: computed(() => getHeadIfArray(route.params['id'])),
    channelParam: computed(() => getHeadIfArray(route.params['channel'])),
    userParam: computed(() => getHeadIfArray(route.params['user'])),
    view: 'none' as Views,
    isInitialView: true
  })

  const useOpenChannel = async () => {
    await originalStore.restored
    return computed(() => _store.getters.app.browserSettings.defaultChannelName)
  }
  const onRouteChangedToIndex = async () => {
    const openChannelPath = await useOpenChannel()
    await router
      .replace(constructChannelPath(openChannelPath.value))
      // 同じ場所に移動しようとした際のエラーを消す
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {})
    return
  }

  const onRouteChangedToNull = () => {
    _store.dispatch.ui.mainView.changePrimaryViewToNull()
    state.view = 'main'
  }

  const onRouteChangedToChannel = () => {
    if (_store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }
    try {
      const id = channelPathToId(
        state.channelParam.split('/'),
        _store.state.domain.channelTree.channelTree
      )
      const { channelIdToShortPathString } = useChannelPath()
      changeViewTitle(`#${channelIdToShortPathString(id)}`)

      setUnreadState(id)

      _store.dispatch.ui.mainView.changePrimaryViewToChannel({
        channelId: id,
        entryMessageId: route.query?.message as string
      })
    } catch (e) {
      state.view = 'not-found'
      return
    }
    state.view = 'main'
  }

  const onRouteChangedToUser = async () => {
    // ユーザーの全件情報がないとユーザー名からユーザーIDがひけない
    await usersMapInitialFetchPromise
    const user = store.getters.entities.userByName(state.currentRouteParam)
    try {
      if (!user) throw 'user not found'

      let dmChannelId = _store.getters.entities.DMChannelIdByUserId(user.id)

      if (!dmChannelId) {
        const { data } = await apis.getUserDMChannel(user.id)
        _store.commit.entities.addDMChannel({
          id: data.id,
          entity: data
        })
        dmChannelId = data.id
      }
      if (!dmChannelId) throw 'failed to fetch DM channel ID'

      setUnreadState(dmChannelId)

      _store.dispatch.ui.mainView.changePrimaryViewToDM({
        channelId: dmChannelId,
        userName: user.name,
        entryMessageId: route.query?.message as string
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
        _store.state.entities.clipFolders[id] ??
        (await _store.dispatch.entities.fetchClipFolder(id))
      changeViewTitle(clipFolder.name)
    } catch {
      state.view = 'not-found'
      return
    }
    _store.dispatch.ui.mainView.changePrimaryViewToClip({ clipFolderId: id })
    state.view = 'main'
  }

  const onRouteChangedToFile = async () => {
    if (_store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }
    const fileId = state.idParam
    if (!_store.state.entities.fileMetaData[fileId]) {
      await _store.dispatch.entities.fetchFileMetaByFileId(fileId)
    }
    const file = _store.state.entities.fileMetaData[fileId]

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
          _store.state.domain.channelTree.channelTree
        )
      } catch (e) {
        state.view = 'not-found'
        return
      }
    }

    // チャンネルが表示されていないときはそのファイルのチャンネルを表示する
    if (_store.state.ui.mainView.primaryView.type === 'null') {
      _store.dispatch.ui.mainView.changePrimaryViewToChannelOrDM({
        channelId: channelId
      })
    }

    const modalPayload = {
      type: 'file' as const,
      id: fileId,
      relatedRoute: RouteName.File as const
    }
    _store.dispatch.ui.modal.replaceModal(modalPayload)
    changeViewTitle(`${channelPath} - ${file.name}`)
    state.view = 'main'
  }

  const onRouteChangedToMessage = async () => {
    if (_store.state.domain.channelTree.channelTree.children.length === 0) {
      return
    }
    const messageId = state.idParam
    const message =
      _store.state.entities.messages[messageId] ??
      (await _store.dispatch.entities.fetchMessage(messageId))
    if (!message?.channelId) {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    const channelId = message.channelId

    if (channelId in _store.state.entities.channels) {
      // paramsでchannelPathを指定すると/がエンコードされてバグる
      // https://github.com/traPtitech/traQ_S-UI/issues/1611
      router.replace({
        path: constructChannelPath(channelIdToPathString(message.channelId)),
        query: { message: message.id }
      })
    } else if (channelId in _store.state.entities.dmChannels) {
      const dmChannel = _store.state.entities.dmChannels[channelId]
      const user = store.state.entities.usersMap.get(dmChannel.userId)
      router.replace({
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
    _store.commit.ui.modal.setIsOnInitialModalRoute(false)
    const routeName = state.currentRouteName
    if (routeName === RouteName.Index) {
      await onRouteChangedToIndex()
      return
    }

    if (routeParam === prevRouteParam) {
      return
    }
    if (!_store.state.app.initialFetchCompleted) {
      onRouteChangedToNull()
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
    _store.commit.ui.modal.setIsOnInitialModalRoute(isOnInitialModalRoute)

    if (state.isInitialView && !isOnInitialModalRoute) {
      // 初回表示かつモーダルを表示する必要がない状態なので、stateをクリア
      if (_store.state.ui.modal.modalState.length !== 0) {
        _store.commit.ui.modal.setState([])
      }
      history.replaceState({ ...history.state, modalState: [] }, '')
    }

    state.isInitialView = false
    closeNav()
  }

  watch(
    computed(() =>
      _store.state.app.initialFetchCompleted ? state.currentRouteParam : ''
    ),
    onRouteParamChange
  )

  const triggerRouteParamChange = () => {
    onRouteParamChange(state.channelParam, '')
  }

  return {
    routeWatcherState: state,
    triggerRouteParamChange
  }
}

export default useRouteWatcher
