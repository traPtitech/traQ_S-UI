<template>
  <div :class="$style.container">
    <div>
      <span>すべてのチャンネル</span>
      <toggle :enabled="isAll" @input="toggleAll" />
      <span>チャンネルアクティビティ</span>
      <toggle :enabled="isPerChannel" @input="togglePerChannel" />
    </div>
    <activity-element
      v-for="message in state.messages"
      :key="message.id"
      :class="$style.element"
      :message="message"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  SetupContext,
  reactive,
  computed,
  onBeforeMount,
  onBeforeUnmount,
  watch,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { setTimelineStreamingState } from '@/lib/websocket'
import ActivityElement from './ActivityElement.vue'
import Toggle from '@/components/UI/Toggle.vue'

const useActivityStream = () => {
  const mode = computed(() => store.state.app.browserSettings.activityMode)

  onBeforeMount(async () => {
    await store.dispatch.domain.fetchActivityTimeline(mode.value)
    if (mode.value.all) {
      setTimelineStreamingState(true)
    }
  })
  watch(
    () => mode.value,
    async (newMode, oldMode) => {
      await store.dispatch.domain.fetchActivityTimeline(newMode)
      if (newMode.all !== oldMode?.all) {
        setTimelineStreamingState(newMode.all)
      }
    }
  )
  onBeforeUnmount(() => {
    if (mode.value.all) {
      setTimelineStreamingState(mode.value.all)
    }
  })
}

const useActivityMode = () => {
  const isAll = ref(store.getters.app.browserSettings.isActivityModeAll)
  const isPerChannel = ref(
    store.getters.app.browserSettings.isActivityModePerChannel
  )

  const toggleAll = () => {
    isAll.value = !isAll.value
    store.commit.app.browserSettings.setActivityModeAll(isAll.value)
  }
  const togglePerChannel = () => {
    isPerChannel.value = !isPerChannel.value
    store.commit.app.browserSettings.setActivityModePerChannel(
      isPerChannel.value
    )
  }
  return {
    isAll,
    toggleAll,
    isPerChannel,
    togglePerChannel
  }
}

export default defineComponent({
  name: 'Activity',
  components: {
    Toggle,
    ActivityElement
  },
  setup(_, context: SetupContext) {
    useActivityStream()
    const {
      isAll,
      toggleAll,
      isPerChannel,
      togglePerChannel
    } = useActivityMode()

    const state = reactive({
      messages: computed(() => store.state.domain.activityTimeline)
    })
    return {
      isAll,
      toggleAll,
      isPerChannel,
      togglePerChannel,
      state
    }
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 0 16px 0 0;
}
.element {
  margin: 16px 0;
}
</style>
