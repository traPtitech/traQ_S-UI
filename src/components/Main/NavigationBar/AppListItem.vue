<template>
  <a
    :class="$style.container"
    :href="appLink"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span v-if="isSvg" :class="$style.icon" v-html="svgHtml"></span>
    <img v-else :class="$style.icon" :src="`/img/services/${iconPath}`" />
    <span :class="$style.label">{{ label }}</span>
  </a>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'AppListItem',
  props: {
    iconPath: { type: String, required: true },
    label: { type: String, default: '' },
    appLink: { type: String, default: '' }
  },
  setup(props) {
    const isSvg = computed(() => {
      try {
        return new URL(props.iconPath, 'https://example.com').pathname.endsWith(
          '.svg'
        )
      } catch {
        return false
      }
    })

    const svgHtml = ref('')
    watch(
      () => props.iconPath,
      async path => {
        if (!isSvg.value) return

        const { data } = await axios.get(`/img/services/${path}`)
        svgHtml.value = data
      },
      { immediate: true }
    )

    return { isSvg, svgHtml }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 16px 8px;
  border-radius: 8px;
  flex: 1 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  &:hover {
    @include color-ui-primary;
    @include background-tertiary;
  }
}
.icon {
  width: 32px;
  height: 32px;
  margin: 4px;
}
.label {
  @include size-body1;
  text-align: center;
}
</style>
