<template>
  <div :class="$style.container">
    <img :class="$style.image" :src="src" :alt="name" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  name: string
  src: string
}>()
</script>

<style lang="scss" module>
.container {
  @include background-primary;
  max-width: 192px;
  min-width: 48px;
  height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  overflow: hidden;
}
.image {
  height: 100%;
  max-width: none;
}
</style>
