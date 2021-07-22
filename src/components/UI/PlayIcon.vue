<template>
  <icon :class="$style.playIcon" name="play" mdi :size="36" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '/@/components/UI/Icon.vue'

export default defineComponent({
  name: 'PlayIcon',
  components: {
    Icon
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
