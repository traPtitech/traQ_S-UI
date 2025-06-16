<template>
  <div :class="$style.container">
    <div :class="$style.title">
      {{ title }}
    </div>
    <div
      v-if="description"
      :class="$style.description"
      :style="descriptionStyle"
    >
      {{ description }}
    </div>
    <div v-if="hostname.length > 0" :class="$style.hostname">
      {{ hostname }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    url: string
    title?: string
    description?: string
    lineClamp?: number
  }>(),
  {
    title: '',
    description: '',
    lineClamp: 2
  }
)

const hostname = computed(() => {
  try {
    return new URL(props.url).hostname
  } catch {
    return ''
  }
})
const descriptionStyle = computed(() => ({
  '-webkit-line-clamp': props.lineClamp
}))
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  display: block;
}
.title {
  @include color-ui-primary;
  @include size-body1;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
  word-break: break-all;
}
.description {
  @include color-ui-secondary;
  @include size-body2;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}
.hostname {
  @include color-ui-secondary;
  @include size-caption;
}
</style>
