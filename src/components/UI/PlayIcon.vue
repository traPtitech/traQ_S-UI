<template>
  <a-icon :class="$style.playIcon" name="play" mdi :size="36" />
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';
</script>

<style lang="scss" module>
.playIcon {
  @include color-common-text-white-primary;
  border-radius: 50%;
  backdrop-filter: brightness(0.5);
}
</style>
