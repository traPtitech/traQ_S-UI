import {
  computed,
  getCurrentInstance,
  onDeactivated,
  onScopeDispose,
  reactive,
  watch
} from 'vue'
import { useRoute } from 'vue-router'

import { dequal } from 'dequal'

import { useRenderKey } from '/@/composables/dom/useRenderKey'
import useNavigationController from '/@/composables/mainView/useNavigationController'
import useChannelPath from '/@/composables/useChannelPath'
import { waitWithAbort } from '/@/lib/basic/async'
import { setFallbackForNullishOrOnError } from '/@/lib/basic/fallback'
import { getFirstQuery } from '/@/lib/basic/url'
import { getFirstParam } from '/@/lib/basic/url'
import { isUUID } from '/@/lib/basic/uuid'
import router, { RouteName, constructChannelPath } from '/@/router'
import { useBrowserSettings } from '/@/store/app/browserSettings'
import { useChannelTree } from '/@/store/domain/channelTree'
import { useChannelsStore } from '/@/store/entities/channels'
import { useClipFoldersStore } from '/@/store/entities/clipFolders'
import { useMessagesStore } from '/@/store/entities/messages'
import { useThreadsStore } from '/@/store/entities/threads'
import { useUsersStore } from '/@/store/entities/users'
import { useMainViewStore } from '/@/store/ui/mainView'
import { useModalStore } from '/@/store/ui/modal'

type Views = 'none' | 'main' | 'not-found'

const useRouteWatcher = () => {
  const route = useRoute()
  const { fetchThread } = useThreadsStore()
  const {
    primaryView,
    changePrimaryViewToChannel,
    changePrimaryViewToThread,
    changePrimaryViewToDM,
    changePrimaryViewToClip,
    resolveChannelView
  } = useMainViewStore()
  const { fetchMessage, fetchFileMetaData } = useMessagesStore()
  const { channelPathStringToId, channelIdToLink, channelIdToPathString } =
    useChannelPath()
  const { closeNav } = useNavigationController()
  const { isOnInitialModalRoute, replaceModal, clearModalState } =
    useModalStore()
  const { getStartupChannelId, getStartupChannelPath } = useBrowserSettings()
  const { channelTree } = useChannelTree()
  const {
    channelsMap,
    dmChannelsMap,
    userIdToDmChannelIdMap,
    bothChannelsMapInitialFetchPromise,
    fetchUserDMChannel
  } = useChannelsStore()
  const { usersMap, usersMapInitialFetchPromise, fetchUserByName } =
    useUsersStore()
  const { fetchClipFolder } = useClipFoldersStore()

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

  const snapshotRoute = () => ({
    name: route.name,
    idParam: getFirstParam(route.params['id']),
    channelParam: getFirstParam(route.params['channel']),
    userParam: getFirstParam(route.params['user']),
    currentRouteParam: state.currentRouteParam,
    query: { ...route.query },
    hash: route.hash,
    entryMessageId: getFirstQuery(route.query['message']) ?? undefined
  })
  type RouteContext = {
    snapshot: ReturnType<typeof snapshotRoute>
    signal: AbortSignal
    wait: <T>(promise: T | Promise<T>) => Promise<T>
  }

  const onRouteChangedToIndex = async (context: RouteContext) => {
    const startupPath = await context.wait(getStartupChannelPath())
    context.signal.throwIfAborted()
    await context.wait(router.replace(constructChannelPath(startupPath)))
    context.signal.throwIfAborted()
  }

  let normalizedThreadRoute: string | undefined
  const onRouteChangedToChannel = async (context: RouteContext) => {
    // チャンネルIDをチャンネルパスに変換するのに必要
    await context.wait(bothChannelsMapInitialFetchPromise)
    context.signal.throwIfAborted()

    if (channelTree.value.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }

    const pathOrId = context.snapshot.channelParam ?? ''
    const isNormalization = normalizedThreadRoute === pathOrId
    normalizedThreadRoute = undefined

    const id = (() => {
      if (channelsMap.value.has(pathOrId)) {
        return pathOrId
      }

      return setFallbackForNullishOrOnError(null).exec(() =>
        channelPathStringToId(pathOrId)
      )
    })()

    if (!id) {
      const threadId = pathOrId.split('/').at(-1) ?? ''
      if (isUUID(threadId)) {
        const entryMessageId = context.snapshot.entryMessageId
        let channel
        try {
          channel = await context.wait(
            fetchThread(threadId, { force: !isNormalization })
          )
          context.signal.throwIfAborted()
        } catch {
          context.signal.throwIfAborted()
          state.view = 'not-found'
          return
        }

        // SDKにスレッドの型が追加されるまでは応答のフィールドを確認する
        if (
          channel &&
          'parentMessageId' in channel &&
          typeof channel.parentMessageId === 'string' &&
          channel.parentMessageId
        ) {
          changePrimaryViewToThread({
            channelId: channel.id,
            entryMessageId
          })
          state.view = 'main'

          const parentId = channel.parentId
          const parentPath = parentId ? channelIdToPathString(parentId) : null
          if (parentPath) {
            const threadPath = `${parentPath}/${channel.id}`
            if (pathOrId !== threadPath) {
              normalizedThreadRoute = threadPath
              await context.wait(
                router.replace({
                  path: constructChannelPath(threadPath),
                  query: context.snapshot.query,
                  hash: context.snapshot.hash
                })
              )
              context.signal.throwIfAborted()
            }
          }
          return
        }
      }
      const startupPath = await context.wait(getStartupChannelPath())
      context.signal.throwIfAborted()
      return router.replace(constructChannelPath(startupPath))
    }

    changePrimaryViewToChannel({
      channelId: id,
      entryMessageId: context.snapshot.entryMessageId
    })

    state.view = 'main'
  }

  const onRouteChangedToUser = async (context: RouteContext) => {
    try {
      const user = await context.wait(
        fetchUserByName({
          userName: context.snapshot.currentRouteParam,
          cacheStrategy: 'useCache'
        })
      )
      context.signal.throwIfAborted()
      if (!user) throw new Error('user not found')

      const dmChannelId =
        userIdToDmChannelIdMap.value.get(user.id) ??
        (await context.wait(fetchUserDMChannel(user.id)))
      context.signal.throwIfAborted()

      if (!dmChannelId) throw new Error('failed to fetch DM channel ID')

      changePrimaryViewToDM({
        channelId: dmChannelId,
        userName: user.name,
        entryMessageId: context.snapshot.entryMessageId
      })
      state.view = 'main'
    } catch {
      context.signal.throwIfAborted()
      state.view = 'not-found'
      return
    }
  }

  const onRouteChangedToClipFolders = async (context: RouteContext) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = context.snapshot.idParam!
    const clipFolder = await context.wait(
      fetchClipFolder({
        clipFolderId: id,
        cacheStrategy: 'useCache'
      })
    )
    context.signal.throwIfAborted()
    if (!clipFolder) {
      state.view = 'not-found'
      return
    }
    changePrimaryViewToClip({ clipFolderId: id })
    state.view = 'main'
  }

  const onRouteChangedToFile = async (context: RouteContext) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fileId = context.snapshot.idParam!
    const file = await context.wait(fetchFileMetaData({ fileId }))
    context.signal.throwIfAborted()

    if (!file) {
      // ファイルがなかった
      state.view = 'not-found'
      return
    }

    // チャンネルIDをチャンネルパスに変換するのに必要
    await context.wait(bothChannelsMapInitialFetchPromise)
    context.signal.throwIfAborted()

    if (channelTree.value.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      return
    }

    const channelId = await context.wait(
      (() => {
        if (file.channelId) {
          return file.channelId
        } else {
          return getStartupChannelId()
        }
      })()
    )
    context.signal.throwIfAborted()

    // チャンネルが表示されていないときはそのファイルのチャンネルを表示する
    if (
      primaryView.value.type === 'channel' &&
      primaryView.value.channelId === ''
    ) {
      const view = await context.wait(resolveChannelView({ channelId }))
      context.signal.throwIfAborted()
      // 非同期取得が終わった後にも、背景画面が未設定か確認する。
      if (
        primaryView.value.type === 'channel' &&
        primaryView.value.channelId === ''
      ) {
        if (view.type === 'channel') changePrimaryViewToChannel(view)
        else if (view.type === 'thread') changePrimaryViewToThread(view)
        else changePrimaryViewToDM(view)
      }
    }

    replaceModal({
      type: 'file',
      id: fileId,
      relatedRoute: RouteName.File
    })
    state.view = 'main'
  }

  const onRouteChangedToMessage = async (context: RouteContext) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const messageId = context.snapshot.idParam!
    const message = await context.wait(fetchMessage({ messageId }))
    context.signal.throwIfAborted()
    if (!message?.channelId) {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    const channelId = message.channelId

    // チャンネルIDをチャンネルパスに変換するのに必要
    await context.wait(bothChannelsMapInitialFetchPromise)
    context.signal.throwIfAborted()
    if (channelTree.value.children.length === 0) {
      return
    }

    if (!dmChannelsMap.value.has(channelId)) {
      if (!channelsMap.value.has(channelId)) {
        try {
          await context.wait(fetchThread(channelId, { force: true }))
          context.signal.throwIfAborted()
        } catch {
          context.signal.throwIfAborted()
          state.view = 'not-found'
          return
        }
      }
      const link = channelIdToLink(channelId)
      if (!link) {
        state.view = 'not-found'
        return
      }
      if (!channelsMap.value.has(channelId)) {
        normalizedThreadRoute = link.slice('/channels/'.length)
      }
      // paramsでchannelPathを指定すると/がエンコードされてバグる
      // https://github.com/traPtitech/traQ_S-UI/issues/1611
      router.replace({
        path: link,
        query: { message: message.id }
      })
    } else if (dmChannelsMap.value.has(channelId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const dmChannel = dmChannelsMap.value.get(channelId)!
      // ユーザーIDからユーザー名への変換に必要
      await context.wait(usersMapInitialFetchPromise)
      context.signal.throwIfAborted()
      const user = usersMap.value.get(dmChannel.userId)
      router.replace({
        name: RouteName.User,
        params: { user: user?.name ?? '' },
        query: { message: message.id }
      })
    } else {
      // チャンネルがなかった
      state.view = 'not-found'
      return
    }

    useRenderKey('messages').refresh()
  }

  let controller: AbortController | undefined
  const cancelRoute = () => controller?.abort()
  onScopeDispose(cancelRoute)
  if (getCurrentInstance()) onDeactivated(cancelRoute)

  const runRoute = async () => {
    cancelRoute()
    const current = new AbortController()
    controller = current
    const context: RouteContext = {
      snapshot: snapshotRoute(),
      signal: current.signal,
      wait: promise => waitWithAbort(Promise.resolve(promise), current.signal)
    }
    const routeName = context.snapshot.name
    try {
      isOnInitialModalRoute.value = false
      switch (routeName) {
        case RouteName.Index:
          await onRouteChangedToIndex(context)
          return
        case RouteName.Channel:
          await onRouteChangedToChannel(context)
          break
        case RouteName.User:
          await onRouteChangedToUser(context)
          break
        case RouteName.ClipFolders:
          await onRouteChangedToClipFolders(context)
          break
        case RouteName.File:
          await onRouteChangedToFile(context)
          break
        case RouteName.Message:
          await onRouteChangedToMessage(context)
          break
        default:
          return
      }
      current.signal.throwIfAborted()
      // ファイルURLを踏むなどして、アクセス時点のURLでモーダルを表示する場合
      const isOnInitialModalRouteValue =
        state.isInitialView &&
        history.state?.modalState &&
        !!history.state?.modalState[0]?.relatedRoute
      isOnInitialModalRoute.value = isOnInitialModalRouteValue

      if (state.isInitialView && !isOnInitialModalRouteValue) {
        // 初回表示かつモーダルを表示する必要がない状態なので、stateをクリア
        clearModalState()
      }

      state.isInitialView = false
      closeNav()
    } catch {
      if (current.signal.aborted) return
      state.view = 'not-found'
    }
  }

  watch(
    () => snapshotRoute(),
    (to, from) => {
      if (!dequal(to, from)) void runRoute()
    },
    { flush: 'sync' }
  )

  const triggerRouteParamChange = () => {
    void runRoute()
  }

  return { routeWatcherState: state, triggerRouteParamChange }
}

export default useRouteWatcher
