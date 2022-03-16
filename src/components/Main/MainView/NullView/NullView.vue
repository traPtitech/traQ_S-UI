<template>
  <div :class="$style.container">
    <a-icon :class="$style.logo" name="traQ" />
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';


</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: var(--specific-main-view-background);
}

.logo {
  @include color-accent-primary;
  height: min(20vmin, 100px);
  width: min(20vmin, 100px);
}
</style>
