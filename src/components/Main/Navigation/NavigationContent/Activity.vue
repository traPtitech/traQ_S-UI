<template>
  <div :class="$style.container">
    <div :class="$style.buttons">
      <toggle-button
        v-model="isNotAll"
        :class="$style.button"
        title="通知/未読購読チャンネルのみ表示"
        icon-name="notified"
      />
      <toggle-button
        v-model="isPerChannel"
        :class="$style.button"
        title="同じチャンネルでは一つしかメッセージを表示しない"
        icon-name="comment-multiple-outline"
        icon-mdi
      />
    </div>
    <transition-group name="timeline" tag="div">
      <template v-if="timeline.length > 0">
        <activity-element
          v-for="message in timeline"
          :key="message.id"
          :class="$style.element"
          :type="isPerChannel ? 'channel' : 'message'"
          :message="message"
        />
      </template>
      <empty-state v-else>メッセージがありません</empty-state>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import store from '/@/store'
import ActivityElement from './ActivityElement.vue'
import ToggleButton from './ToggleButton.vue'
import useActivityStream from './use/activityStream'
import EmptyState from '/@/components/UI/EmptyState.vue'

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
    ActivityElement,
    EmptyState
  },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  setup(props) {
    const { timeline } = useActivityStream(props)
    const { isNotAll, isPerChannel } = useActivityMode()

    return { isNotAll, isPerChannel, timeline }
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
