<template>
  <div :class="$style.container">
    <span :class="$style.name" :title="name">
      {{ name }}
    </span>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    name?: string
  }>(),
  {
    name: ''
  }
)
</script>

<style lang="scss" module>
.container {
  @include size-body1;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0 8px;
  cursor: pointer;
}
.name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
