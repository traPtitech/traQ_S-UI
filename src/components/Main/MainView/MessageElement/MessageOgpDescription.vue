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
import { defineComponent, computed, reactive } from 'vue'
import { makeStyles } from '@/lib/styles'
import * as CSS from 'csstype'

const useStyles = (props: { lineClamp: number }) =>
  reactive({
    description: makeStyles(
      () =>
        ({
          '-webkit-line-clamp': props.lineClamp
        } as CSS.Properties)
    )
  })

export default defineComponent({
  name: 'MessageOgpContentWebSite',
  props: {
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    lineClamp: {
      type: Number,
      default: 2
    }
  },
  setup(props) {
    const hostname = computed(() => {
      try {
        return new URL(props.url).hostname
      } catch {
        return ''
      }
    })
    const styles = useStyles(props)
    return { hostname, styles }
  }
})
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
}
.description {
  @include color-ui-secondary;
  @include size-body2;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hostname {
  @include color-ui-secondary;
  @include size-caption;
}
</style>
