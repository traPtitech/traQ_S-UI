<template>
  <div :class="$style.container">
    <user-icon :user-id="userId" :size="28" />
    <div>
      <slider
        :value="volume"
        @change="onChange"
        :min="0"
        :max="200"
        tooltip-formatter="{value}%"
        :disabled="disabled || volume === undefined"
        :tooltip="disabled ? 'none' : 'active'"
      />
    </div>
    <div :class="$style.icon">
      <icon v-if="micMuted" mdi name="microphone-off" :size="16" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import Slider from '@/components/UI/Slider.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import Icon from '@/components/UI/Icon.vue'
import { UserId } from '@/types/entity-ids'
import store from '@/store'

const maxVolumeValue = 200

export default defineComponent({
  name: 'QallDetailsPanelUserVolumeSlider',
  components: {
    Slider,
    Icon,
    UserIcon
  },
  props: {
    userId: { type: String as PropType<UserId>, required: true },
    disabled: { type: Boolean, default: false },
    micMuted: { type: Boolean, default: false }
  },
  setup(props) {
    const volume = computed(
      () =>
        (store.state.app.rtc.userVolumeMap[props.userId] ?? 0) * maxVolumeValue
    )
    const onChange = (value: number) => {
      store.commit.app.rtc.setUserVolume({
        userId: props.userId,
        volume: value / maxVolumeValue
      })
    }
    return {
      volume,
      maxVolumeValue,
      onChange
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: grid;
  grid-template-columns: 28px 1fr 16px;
  column-gap: 12px;
  align-items: center;
}
.icon {
  height: 20px;
  opacity: 0.5;
}
</style>
