import { computed, reactive, watch } from 'vue'
import store, { originalStore } from '/@/vuex'
import router, { RouteName, constructChannelPath } from '/@/router'
import useNavigationController from '/@/use/navigationController'
import useChannelPath from '/@/use/channelPath'
import useViewTitle from './viewTitle'
import { LocationQuery, useRoute } from 'vue-router'
import {
  bothChannelsMapInitialFetchPromise,
  usersMapInitialFetchPromise
} from '/@/vuex/entities/promises'
import { getFirstParam, getFirstQuery } from '/@/lib/basic/url'
import { dequal } from 'dequal'
import { useMainViewStore } from '/@/store/ui/mainView'
import { useModalStore } from '/@/store/ui/modal'

type Views = 'none' | 'main' | 'not-found'

const useRouteWatcher = () => {
  const route = useRoute()
  const {
    primaryView,
    changePrimaryViewToChannel,
    changePrimaryViewToDM,
    changePrimaryViewToClip,
    changePrimaryViewToChannelOrDM
  } = useMainViewStore()
  const { channelPathToId, channelIdToPathString, channelIdToLink } =
    useChannelPath()
  const { changeViewTitle } = useViewTitle()
  const { closeNav } = useNavigationController()
  const { isOnInitialModalRoute, replaceModal, clearModalState } =
    useModalStore()

  const state = reactive({
    currentRouteName: computed(() => route.name ?? ''),
    currentRouteParam: computed(
      (): string => state.idParam ?? state.channelParam ?? state.userParam ?? ''
    ),
    idParam: computed(() => getFirstParam(route.params['id'])),
    channelParam: computed(() => getFirstParam(route.params['channel'])),
    userParam: computed(() => getFirstParam(route.params['user'])),
    query: computed(() => route.query),
    view: 'none' as Views,
    isInitialView: true
  })

  const useOpenChannel = async () => {
    await originalStore.restored
    return computed(() => store.getters.app.browserSettings.defaultChannelName)
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

  const onRouteChangedToChannel = async () => {
    // チャンネルIDをチャンネルパスに変換するのに必要
    await bothChannelsMapInitialFetchPromise
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }
    try {
      const id = channelPathToId(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        state.channelParam!.split('/'),
        store.state.domain.channelTree.channelTree
      )
      const { channelIdToShortPathString } = useChannelPath()
      changeViewTitle(`#${channelIdToShortPathString(id)}`)

      changePrimaryViewToChannel({
        channelId: id,
        entryMessageId: getFirstQuery(route.query['message']) ?? undefined
      })
    } catch (e) {
      state.view = 'not-found'
      return
    }
    state.view = 'main'
  }

  const onRouteChangedToUser = async () => {
    try {
      const user = await store.dispatch.entities.fetchUserByName({
        username: state.currentRouteParam,
        cacheStrategy: 'useCache'
      })
      if (!user) throw 'user not found'

      const dmChannelId =
        store.getters.entities.DMChannelIdByUserId(user.id) ??
        (await store.dispatch.entities.fetchUserDMChannel(user.id))

      if (!dmChannelId) throw 'failed to fetch DM channel ID'

      changePrimaryViewToDM({
        channelId: dmChannelId,
        userName: user.name,
        entryMessageId: getFirstQuery(route.query['message']) ?? undefined
      })
      changeViewTitle('@' + user.name)
      state.view = 'main'
    } catch {
      state.view = 'not-found'
      return
    }
  }

  const onRouteChangedToClipFolders = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = state.idParam!
    const clipFolder = await store.dispatch.entities.fetchClipFolder({
      clipFolderId: id,
      cacheStrategy: 'useCache'
    })
    if (!clipFolder) {
      state.view = 'not-found'
      return
    }
    changeViewTitle(clipFolder.name)
    changePrimaryViewToClip({ clipFolderId: id })
    state.view = 'main'
  }

  const onRouteChangedToFile = async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fileId = state.idParam!
    const file = await store.dispatch.entities.messages.fetchFileMetaData({
      fileId
    })

    if (!file) {
      // ファイルがなかった
      state.view = 'not-found'
      return
    }

    // チャンネルIDをチャンネルパスに変換するのに必要
    await bothChannelsMapInitialFetchPromise
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
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

    // チャンネルが表示されていないときはそのファイルのチャンネルを表示する
    if (
      primaryView.value.type === 'channel' &&
      primaryView.value.channelId === ''
    ) {
      changePrimaryViewToChannelOrDM({
        channelId: channelId
      })
    }

    replaceModal({
      type: 'file',
      id: fileId,
      relatedRoute: RouteName.File
    })
    changeViewTitle(`${channelPath} - ${file.name}`)
    state.view = 'main'
  }

  const onRouteChangedToMessage = async () => {
    const message = await store.dispatch.entities.messages.fetchMessage({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      messageId: state.idParam!
    })
    if (!message?.channelId) {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    const channelId = message.channelId

    // チャンネルIDをチャンネルパスに変換するのに必要
    await bothChannelsMapInitialFetchPromise
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      return
    }

    if (store.state.entities.channelsMap.has(channelId)) {
      // paramsでchannelPathを指定すると/がエンコードされてバグる
      // https://github.com/traPtitech/traQ_S-UI/issues/1611
      router.replace({
        path: channelIdToLink(message.channelId),
        query: { message: message.id }
      })
    } else if (store.state.entities.dmChannelsMap.has(channelId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dmChannel = store.state.entities.dmChannelsMap.get(channelId)!
      // ユーザーIDからユーザー名への変換に必要
      await usersMapInitialFetchPromise
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

  type RouteParamWithQuery = readonly [routeParam: string, query: LocationQuery]
  const onRouteParamChange = async (
    [routeParam, query]: RouteParamWithQuery,
    [prevRouteParam, prevQuery]: RouteParamWithQuery
  ) => {
    isOnInitialModalRoute.value = false
    const routeName = state.currentRouteName
    if (routeName === RouteName.Index) {
      await onRouteChangedToIndex()
      return
    }

    if (routeParam === prevRouteParam && dequal(query, prevQuery)) {
      return
    }

    switch (routeName) {
      case RouteName.Channel:
        await onRouteChangedToChannel()
        break
      case RouteName.User:
        await onRouteChangedToUser()
        break
      case RouteName.ClipFolders:
        await onRouteChangedToClipFolders()
        break
      case RouteName.File:
        await onRouteChangedToFile()
        break
      case RouteName.Message:
        await onRouteChangedToMessage()
        break
    }

    // ファイルURLを踏むなどして、アクセス時点のURLでモーダルを表示する場合
    const isOnInitialModalRouteValue =
      state.isInitialView &&
      history.state?.modalState &&
      !!history.state?.modalState[0]?.relatedRoute
    isOnInitialModalRoute.value = isOnInitialModalRouteValue

    if (state.isInitialView && !isOnInitialModalRoute) {
      // 初回表示かつモーダルを表示する必要がない状態なので、stateをクリア
      clearModalState()
    }

    state.isInitialView = false
    closeNav()
  }

  watch<RouteParamWithQuery>(
    () => [state.currentRouteParam, state.query] as const,
    onRouteParamChange
  )

  const triggerRouteParamChange = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    onRouteParamChange([state.channelParam!, {}], ['', {}])
  }

  return {
    routeWatcherState: state,
    triggerRouteParamChange
  }
}

export default useRouteWatcher
