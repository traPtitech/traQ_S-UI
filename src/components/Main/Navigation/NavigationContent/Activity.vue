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
        title="同じチャンネルでも複数のメッセージを表示する"
        icon-name="comment-multiple-outline"
        icon-mdi
        :value="isPerChannel"
        @click="togglePerChannel"
      />
    </div>
    <template v-if="isPerChannel">
      <activity-channel-element
        v-for="message in state.messages"
        :key="message.id"
        :class="$style.element"
        :message="message"
      />
    </template>
    <template v-else>
      <activity-message-element
        v-for="message in state.messages"
        :key="message.id"
        :class="$style.element"
        :message="message"
      />
    </template>
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
import { ws, setTimelineStreamingState } from '@/lib/websocket'
import ActivityChannelElement from './ActivityChannelElement.vue'
import ActivityMessageElement from './ActivityMessageElement.vue'
import ToggleButton from './ToggleButton.vue'

const useActivityStream = () => {
  const mode = computed(() => store.state.app.browserSettings.activityMode)

  const fetch = (payload: { all?: boolean; perChannel?: boolean }) => {
    return store.dispatch.domain.fetchActivityTimeline(payload)
  }
  const handler = () => {
    fetch(mode.value)
  }

  onBeforeMount(async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    await fetch(mode.value).catch(() => {})
    if (mode.value.all) {
      setTimelineStreamingState(true)
    }

    ws.addEventListener('reconnect', handler)
  })
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
    ActivityChannelElement,
    ActivityMessageElement
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
  margin-left: 12px;
}

.element {
  margin: 16px 0;
}
</style>
