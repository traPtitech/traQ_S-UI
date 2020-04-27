<template>
  <div :class="$style.container">
    <user-icon :class="$style.icon" :user-id="userId" :size="28" />
    <div :class="$style.slider">
      <slider
        :value="100"
        :min="0"
        :max="200"
        tooltip-formatter="{value}%"
        :disabled="disabled"
        :tooltip="disabled ? 'none' : 'active'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import Slider from '@/components/UI/Slider.vue'
import UserIcon from '@/components/UI/UserIcon.vue'
import { UserId } from '@/types/entity-ids'

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
  setup() {
    return {}
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
