<template>
  <a-icon :class="$style.playIcon" name="play" mdi :size="36" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

export default defineComponent({
  name: 'PlayIcon',
  components: {
    AIcon
  }
})
</script>

<style lang="scss" module>
.playIcon {
  @include color-common-text-white-primary;
  border-radius: 50%;
  backdrop-filter: brightness(0.5);
}
</style>
