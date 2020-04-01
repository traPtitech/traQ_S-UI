<template>
  <not-found
    v-if="routeWatcherState.view === 'not-found'"
    :route-param="routeWatcherState.currentRouteParam"
    :route-name="routeWatcherState.currentRouteName"
  />
  <div
    v-else-if="routeWatcherState.view === 'main'"
    :class="$style.homeWrapper"
    @touchstart="touchstartHandler"
    @touchmove="touchmoveHandler"
    @touchend="touchendHandler"
  >
    <div :class="$style.homeContainer">
      <div :class="$style.navigationWrapper">
        <navigation />
      </div>
      <div :class="$style.mainViewWrapper" :style="mainViewWrapperStyle">
        <main-view-controller :isActive="isNavAppeared" />
      </div>
    </div>
    <modal-container />
    <stamp-picker-container />
  </div>
  <div v-else></div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  reactive,
  watchEffect,
  watch,
  onMounted
} from '@vue/composition-api'
import { setupWebSocket } from '@/lib/websocket'
import MainViewController from '@/components/Main/MainView/MainViewController.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'
import ModalContainer from '@/components/Main/Modal/ModalContainer.vue'
import StampPickerContainer from '@/components/Main/StampPicker/StampPickerContainer.vue'
import store from '@/store'
import { RouteName, constructChannelPath } from '@/router'
import useChannelPath from '@/use/channelPath'
import useSwipeDetector from '@/use/swipeDetector'
import useSwipeDrawer from '@/use/swipeDrawer'
import useViewTitle from '@/views/use/viewTitle'

// TODO: 起動時チャンネル
const defaultChannelName = 'random'

type Views = 'none' | 'main' | 'not-found'

const useRouteWacher = (context: SetupContext) => {
  const { channelPathToId } = useChannelPath()
  const { changeViewTitle } = useViewTitle()

  const state = reactive({
    currentRouteName: computed(() => context.root.$route.name),
    currentRouteParam: computed(
      (): string =>
        state.channelParam ?? state.messageParam ?? state.userParam ?? ''
    ),
    channelParam: computed(() => context.root.$route.params['channel']),
    messageParam: computed(() => context.root.$route.params['message']),
    userParam: computed(() => context.root.$route.params['user']),
    view: 'none' as Views
  })

  const watcher = watchEffect(() => {
    if (state.currentRouteName === RouteName.Index) {
      // 何も指定されていない
      context.root.$router.replace({
        name: RouteName.Channel,
        params: { channel: defaultChannelName }
      })
      return
    }

    if (state.currentRouteName === RouteName.Channel) {
      if (store.state.domain.channelTree.channelTree.children.length === 0) {
        // まだチャンネルツリーが構築されていない
        return
      }
      try {
        const id = channelPathToId(
          state.channelParam.split('/'),
          store.state.domain.channelTree.channelTree
        )
        store.dispatch.domain.messagesView.changeCurrentChannel(id)

        state.view = 'main'

        changeViewTitle(`#${state.channelParam}`)
      } catch {
        state.view = 'not-found'
      }
    }
  })
  return {
    routeWatcherState: state,
    routeWatcher: watcher
  }
}

export default defineComponent({
  name: 'Home',
  components: {
    Navigation,
    MainViewController,
    ModalContainer,
    StampPickerContainer,
    NotFound: () =>
      import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
  },
  setup(_, context: SetupContext) {
    const {
      swipeDetectorState,
      touchmoveHandler,
      touchstartHandler,
      touchendHandler
    } = useSwipeDetector()

    // TODO: 幅をどこかに移す
    const navWidth = 320
    const { swipeDrawerState, isAppeared } = useSwipeDrawer(
      swipeDetectorState,
      'right',
      navWidth,
      navWidth / 2,
      navWidth / 2
    )

    const mainViewWrapperStyle = computed(() => ({
      transform: `translateX(${swipeDrawerState.currentPosition}px)`
    }))

    const { routeWatcherState, routeWatcher } = useRouteWacher(context)

    setupWebSocket()

    onMounted(async () => {
      try {
        await store.dispatch.domain.me.fetchMe()
      } catch {
        location.href = '/login'
      }

      // 初回fetch
      store.dispatch.entities.fetchUsers()
      store.dispatch.entities.fetchUserGroups()
      store.dispatch.entities.fetchChannels()
      store.dispatch.domain.fetchChannelActivity()
      store.dispatch.domain.me.fetchUnreadChannels()
    })

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

      routeWatcherState,

      isNavAppeared: isAppeared,

      mainViewWrapperStyle
    }
  }
})
</script>

<style lang="scss" module>
.homeWrapper {
  height: 100%;
}
.homeContainer {
  height: 100%;
  display: flex;
  [data-is-mobile] & {
    position: relative;
  }
}
.navigationWrapper {
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  [data-is-mobile] & {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.mainViewWrapper {
  width: 100%;
  height: 100%;
}
</style>
