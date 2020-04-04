import { SetupContext, computed, reactive, watch } from '@vue/composition-api'
import store from '@/store'
import { RouteName } from '@/router'
import useChannelPath from '@/use/channelPath'
import useViewTitle from './viewTitle'

// TODO: 起動時チャンネル
const defaultChannelName = 'random'

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
    view: 'none' as Views,
    isInitialView: true
  })

  const onRouteChangedToIndex = () => {
    context.root.$router.replace({
      name: RouteName.Channel,
      params: { channel: defaultChannelName }
    })
    return
  }
  const onRouteChangedToChannel = () => {
    if (store.state.domain.channelTree.channelTree.children.length === 0) {
      // まだチャンネルツリーが構築されていない
      console.log('No Channel Tree')
      return
    }
    try {
      const id = channelPathToId(
        state.channelParam.split('/'),
        store.state.domain.channelTree.channelTree
      )
      store.dispatch.domain.messagesView.changeCurrentChannel(id)
      changeViewTitle(`#${state.channelParam}`)
      state.view = 'main'
    } catch (e) {
      state.view = 'not-found'
    }
    return
  }
  const onRouteChangedToFile = async () => {
    if (
      history.state?.modalState?.length &&
      history.state.modalState[history.state.modalState.length - 1]
        ?.relatedRoute === RouteName.File
    ) {
      return
    }
    const fileId = state.idParam
    if (!store.state.entities.fileMetaData[fileId]) {
      await store.dispatch.entities.fetchFileMetaByFileId(fileId)
    }
    const file = store.state.entities.fileMetaData[fileId]

    if (!file.channelId) {
      // ファイルに関連づいたチャンネルIDがなかった
      state.view = 'not-found'
      return
    }
    const channelPath = channelIdToPath(file.channelId)
    store.dispatch.domain.messagesView.changeCurrentChannel(file.channelId)
    const modalPayload = {
      type: 'file' as const,
      id: fileId,
      relatedRoute: RouteName.File as const
    }
    store.dispatch.ui.modal.replaceModal(modalPayload)
    changeViewTitle(`#${channelPath} - ${file.name}`)
    state.view = 'main'
  }

  const onRouteParamChange = async (param: string, prevParam: string) => {
    const routeName = state.currentRouteName
    if (routeName === RouteName.Index) {
      onRouteChangedToIndex()
    } else if (routeName === RouteName.Channel) {
      onRouteChangedToChannel()
      console.log(routeName, param)
    } else if (routeName === RouteName.File) {
      await onRouteChangedToFile()
    }
    state.isInitialView = false
  }

  const watcher = watch(
    computed(() =>
      store.state.app.initialFetchCompleted ? state.currentRouteParam : ''
    ),
    onRouteParamChange
  )
  onRouteParamChange(state.channelParam, '')

  return {
    routeWatcherState: state,
    routeWatcher: watcher,
    onRouteChangedToIndex,
    onRouteChangedToChannel,
    onRouteChangedToFile
  }
}

export default useRouteWacher
