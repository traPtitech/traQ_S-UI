<template>
  <div :class="$style.container">
    <div :class="$style.buttons">
      <toggle-button
        :class="$style.button"
        title="通知チャンネルのみ表示"
        icon-name="notified"
        :value="!isAll"
        @click="toggleAll"
      />
      <toggle-button
        :class="$style.button"
        title="同じチャンネルでは一つしかメッセージを表示しない"
        icon-name="comment-multiple-outline"
        icon-mdi
        :value="isPerChannel"
        @click="togglePerChannel"
      />
    </div>
    <activity-element
      v-for="message in state.messages"
      :key="message.id"
      :class="$style.element"
      :type="isPerChannel ? 'channel' : 'message'"
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
  onBeforeUnmount,
  watch,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { ws, setTimelineStreamingState } from '@/lib/websocket'
import ActivityElement from './ActivityElement.vue'
import ToggleButton from './ToggleButton.vue'

const useActivityStream = () => {
  const mode = computed(() => store.state.app.browserSettings.activityMode)

  const fetch = (payload: { all?: boolean; perChannel?: boolean }) => {
    return store.dispatch.domain.fetchActivityTimeline(payload)
  }
  const handler = () => {
    fetch(mode.value)
  }

  // mountedの際に`oldMode`が`undefined`なものが発火する
  watch(
    () => mode.value,
    async (newMode, oldMode) => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await fetch(mode.value).catch(() => {})
      if (newMode.all !== oldMode?.all) {
        setTimelineStreamingState(newMode.all)
      }
    }
  )
  ws.addEventListener('reconnect', handler)

  onBeforeUnmount(() => {
    if (mode.value.all) {
      setTimelineStreamingState(mode.value.all)
    }

    ws.removeEventListener('reconnect', handler)
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
    ToggleButton,
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

.buttons {
  display: flex;
}

.button {
  flex: 1 1;
}
.button + .button {
  margin-left: 16px;
}

.element {
  margin: 16px 0;
}
</style>
