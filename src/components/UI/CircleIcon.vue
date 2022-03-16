<template>
  <div :class="$style.circle" :style="iconStyle">
    <a-icon :class="$style.icon" :name="name" :mdi="mdi" :size="size" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

const props = withDefaults(
  defineProps<{
    color: string
    background: string
    name: string
    mdi?: boolean
    size?: number
  }>(),
  {
    size: 24
  }
)

const iconStyle = computed(() => ({
  color: props.color,
  background: props.background
}))
</script>

<style lang="scss" module>
.circle {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.icon {
  padding: 16%;
}
</style>
