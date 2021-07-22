<template>
  <div
    v-if="maxLength"
    :class="$style.count"
    :data-is-exceeded="$boolAttr(isExceeded)"
  >
    {{ length }}/{{ maxLength }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useMaxLength from '/@/use/maxLength'

export default defineComponent({
  name: 'LengthCount',
  props: {
    val: {
      type: String,
      default: ''
    },
    maxLength: {
      type: Number,
      default: undefined
    }
  },
  setup(props) {
    const { length, isExceeded } = useMaxLength(props)
    return { length, isExceeded }
  }
})
</script>

<style lang="scss" module>
.count {
  @include color-ui-secondary;
  @include size-caption;
  text-align: right;
  &[data-is-exceeded] {
    color: $theme-accent-error;
  }
}
</style>
