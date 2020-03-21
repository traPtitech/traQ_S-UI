<template>
  <div
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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  computed,
  watchEffect,
  onMounted
} from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'
import store from '@/store'
import useSwipeDetector from '@/use/swipeDetector'
import useSwipeDrawer from '@/use/swipeDrawer'

const useRouteChangeWacher = (context: SetupContext) => {
  const channelParam = computed(() => context.root.$route.params['channel'])
  const messageParam = computed(() => context.root.$route.params['message'])
  const userParam = computed(() => context.root.$route.params['user'])
  return watchEffect(() => {
    console.log(channelParam.value)
    console.log(messageParam.value)
    console.log(userParam.value)
  })
}

export default defineComponent({
  name: 'Home',
  components: {
    Navigation,
    MainViewController
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

    onMounted(() => {
      // 暫定
      store.dispatch.entities.fetchUsers()
      store.dispatch.entities.fetchStamps()
      store.dispatch.entities.fetchUserGroups()
    })
    const watcher = useRouteChangeWacher(context)

    return {
      touchstartHandler,
      touchmoveHandler,
      touchendHandler,

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
