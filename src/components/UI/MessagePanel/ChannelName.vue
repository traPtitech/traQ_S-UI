<template>
  <div :class="$style.path" :data-is-title="$boolAttr(isTitle)">
    {{ path }}
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    path: string
    isTitle?: boolean
  }>(),
  {
    isTitle: false
  }
)
</script>

<style lang="scss" module>
.path {
  @include color-ui-secondary;
  @include size-body2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-is-title] {
    @include color-ui-primary;
    @include size-body1;
    font-weight: bold;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
    word-break: break-all;
  }
  &::before {
    content: '# ';
  }
}
</style>
