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
      <empty-state v-else> メッセージがありません </empty-state>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
import useActivityStream from './composables/useActivityStream'
import { useBrowserSettings } from '/@/store/app/browserSettings'

const useActivityMode = () => {
  const { activityMode } = useBrowserSettings()

  // 反転していることに注意
  const isNotAll = computed({
    get: () => !activityMode.value.all,
    set: v => {
      activityMode.value.all = !v
    }
  })
  const isPerChannel = computed({
    get: () => activityMode.value.perChannel,
    set: v => {
      activityMode.value.perChannel = v
    }
  })

  return { isNotAll, isPerChannel }
}
</script>

<script lang="ts" setup>
import ActivityElement from './ActivityElement.vue'
import ToggleButton from './ToggleButton.vue'
import EmptyState from '/@/components/UI/EmptyState.vue'

const { timeline } = useActivityStream()
const { isNotAll, isPerChannel } = useActivityMode()
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
  display: block;
  margin: 16px 0;
}
</style>
