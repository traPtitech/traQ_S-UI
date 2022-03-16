<template>
  <div :class="$style.container">
    <div :class="$style.title">{{ title }}</div>
    <div
      v-if="description"
      :class="$style.description"
      :style="styles.description"
    >
      {{ description }}
    </div>
    <div v-if="hostname.length > 0" :class="$style.hostname">
      {{ hostname }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, reactive } from 'vue'

const useStyles = (props: { lineClamp: number }) =>
  reactive({
    description: computed(() => ({
      '-webkit-line-clamp': props.lineClamp
    }))
  })
</script>

<script lang="ts" setup>
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
const styles = useStyles(props)
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
