<template>
  <div :class="$style.container">
    <div :class="$style.buttons">
      <toggle-button
        :class="$style.button"
        title="通知/未読購読チャンネルのみ表示"
        icon-name="notified"
        v-model="isNotAll"
      />
      <toggle-button
        :class="$style.button"
        title="同じチャンネルでは一つしかメッセージを表示しない"
        icon-name="comment-multiple-outline"
        icon-mdi
        v-model="isPerChannel"
      />
    </div>
    <transition-group name="timeline" tag="div">
      <activity-element
        v-for="message in messages"
        :key="message.id"
        :class="$style.element"
        :type="isPerChannel ? 'channel' : 'message'"
        :message="message"
      />
    </transition-group>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  onBeforeUnmount,
  watch,
  onMounted
} from 'vue'
import store from '@/store'
import { ws, setTimelineStreamingState } from '@/lib/websocket'
import ActivityElement from './ActivityElement.vue'
import ToggleButton from './ToggleButton.vue'

const useActivityStream = () => {
  const mode = computed(() => store.state.app.browserSettings.activityMode)

  const fetch = (payload: { all?: boolean; perChannel?: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return store.dispatch.domain.fetchActivityTimeline(payload).catch(() => {})
  }
  const handler = () => {
    fetch(mode.value)
  }

  onMounted(async () => {
    setTimelineStreamingState(mode.value.all)
    await fetch(mode.value)
  })

  watch(mode, async (newMode, oldMode) => {
    if (newMode.all !== oldMode.all) {
      setTimelineStreamingState(newMode.all)
    }
    await fetch(mode.value)
  })
  ws.addEventListener('reconnect', handler)

  onBeforeUnmount(() => {
    if (mode.value.all) {
      setTimelineStreamingState(mode.value.all)
    }

    ws.removeEventListener('reconnect', handler)
  })
}

const useActivityMode = () => {
  // 反転していることに注意
  const isNotAll = computed({
    get: () => !store.getters.app.browserSettings.isActivityModeAll,
    set: v => {
      store.commit.app.browserSettings.setActivityModeAll(!v)
    }
  })
  const isPerChannel = computed({
    get: () => store.getters.app.browserSettings.isActivityModePerChannel,
    set: v => {
      store.commit.app.browserSettings.setActivityModePerChannel(v)
    }
  })

  return { isNotAll, isPerChannel }
}

export default defineComponent({
  name: 'Activity',
  components: {
    ToggleButton,
    ActivityElement
  },
  setup() {
    useActivityStream()
    const { isNotAll, isPerChannel } = useActivityMode()
    const messages = computed(() => store.state.domain.activityTimeline)

    return { isNotAll, isPerChannel, messages }
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
