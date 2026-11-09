<template>
  <div :class="$style.container">
    <button type="button" :class="$style.card" @click.stop="emit('open')">
      <span :class="$style.header">
        <span :class="$style.title" :title="title">{{ title }}</span>
        <span v-if="$slots['badge']" :class="$style.badge">
          <slot name="badge" />
        </span>
      </span>
      <span v-if="$slots['default']" :class="$style.preview">
        <slot />
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'open'): void
}>()
</script>

<style lang="scss" module>
.container {
  position: relative;
  min-width: 0;
  margin-top: 12px;
  margin-left: 50px;

  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: -30px;
    width: 24px;
    height: 30px;
    border-left: 2px solid $theme-ui-tertiary-default;
    border-bottom: 2px solid $theme-ui-tertiary-default;
    border-bottom-left-radius: 16px;
    pointer-events: none;
  }
}

.card {
  @include background-secondary;
  @include color-ui-secondary;
  @include size-body2;
  display: block;
  width: 100%;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    @include background-tertiary;
  }

  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: 2px;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}

.title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: bold;
}

.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
}

.preview {
  display: block;
  min-width: 0;
  margin-top: 4px;
}
</style>
