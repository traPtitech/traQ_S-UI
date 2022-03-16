<template>
  <div
    v-if="maxLength"
    :class="$style.count"
    :data-is-exceeded="$boolAttr(isExceeded)"
  >
    {{ length }}/{{ maxLength }}
  </div>
</template>

<script lang="ts" setup>
import useMaxLength from '/@/composables/useMaxLength'

const props = withDefaults(
  defineProps<{
    val?: string
    maxLength?: number
  }>(),
  {
    val: ''
  }
)

const { length, isExceeded } = useMaxLength(props)
</script>

<style lang="scss" module>
.count {
  @include color-ui-secondary;
  @include size-caption;
  text-align: right;
  &[data-is-exceeded] {
    color: $theme-accent-error-default;
  }
}
</style>
