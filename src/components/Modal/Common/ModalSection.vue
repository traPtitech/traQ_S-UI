<template>
  <section :class="$style.section">
    <h3 :class="$style.title">
      {{ title }}
    </h3>
    <p v-if="description" :class="$style.description">
      {{ description }}
    </p>
    <slot />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ModalSection',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: undefined
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.section {
  // slotの外からスタイルを当てられないため
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
.title {
  @include color-ui-secondary;
  font: {
    size: 1rem;
    weight: bold;
  }
}
.description {
  @include color-ui-secondary;
  margin-top: 4px;
  font: {
    size: 0.875rem;
    weight: normal;
  }
}
</style>
