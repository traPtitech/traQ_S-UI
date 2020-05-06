<template>
  <div :class="$style.path" :data-is-title="isTitle">
    {{ path }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'ChannelName',
  props: {
    path: {
      type: String,
      required: true
    },
    isTitle: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.path {
  @include color-ui-secondary;
  @include size-body2;
  &[data-is-title] {
    @include color-ui-primary;
    @include size-body1;
    font-weight: bold;
  }
  &::before {
    content: '# ';
  }
}
</style>
