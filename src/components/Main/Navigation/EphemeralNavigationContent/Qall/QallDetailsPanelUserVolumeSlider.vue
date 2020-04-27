<template>
  <div :class="$style.container">
    <user-icon :class="$style.icon" :user-id="userId" :size="28" />
    <div :class="$style.slider">
      <slider
        :value="volume ? volume : 0"
        @change="onChange"
        :min="0"
        :max="200"
        tooltip-formatter="{value}%"
        :disabled="disabled || volume === undefined"
        :tooltip="disabled ? 'none' : 'active'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@vue/composition-api'
import Slider from '@/components/UI/Slider.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'
import store from '@/store'

const maxVolumeValue = 200

export default defineComponent({
  name: 'QallDetailsPanelUserVolumeSlider',
  components: {
    Slider,
    UserIcon
  },
  props: {
    userId: { type: String as PropType<UserId>, required: true },
    disabled: { type: Boolean, default: false }
  },
  setup(props) {
    const volume = computed(
      () => store.state.app.rtc.userVolumeMap[props.userId] * maxVolumeValue
    )
    const onChange = (value: number) => {
      store.commit.app.rtc.setUserVolume({
        userId: props.userId,
        volume: value / maxVolumeValue
      })
    }
    return {
      volume,
      onChange
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.icon {
  margin-right: 12px;
  flex-shrink: 0;
}
.slider {
  width: 100%;
}
</style>
