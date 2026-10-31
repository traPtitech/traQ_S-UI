<template>
  <div :class="$style.container" role="group" aria-label="サイドバーの操作">
    <button
      type="button"
      :class="$style.control"
      aria-label="サイドバーを閉じる"
      title="サイドバーを閉じる"
      @click="emit('close')"
    >
      <AIcon
        mdi
        name="chevron-double"
        :size="28"
        :class="$style.closeIcon"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      :class="[$style.control, $style.modeControl]"
      aria-label="チャンネル情報"
      title="チャンネル情報"
      :aria-pressed="modelValue === 'information'"
      @click="emit('update:modelValue', 'information')"
    >
      <AIcon
        mdi
        name="info-outline"
        :class="$style.modeIcon"
        aria-hidden="true"
      />
    </button>
    <button
      type="button"
      :class="[$style.control, $style.modeControl]"
      aria-label="スレッド一覧"
      title="スレッド一覧"
      :aria-pressed="modelValue === 'threads'"
      @click="emit('update:modelValue', 'threads')"
    >
      <AIcon
        mdi
        name="message-text-outline"
        :class="$style.modeIcon"
        aria-hidden="true"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

defineProps<{
  modelValue: 'information' | 'threads'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'information' | 'threads'): void
  (e: 'close'): void
}>()
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  position: absolute;
  top: 0;
  right: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 56px;
  padding: 4px 6px 6px;
  background: var(--specific-side-bar-background);
  border-bottom-left-radius: 28px;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 0;
    width: 56px;
    height: 28px;
    background: var(--specific-side-bar-background);
    mask: url('/@/assets/sidebar-curve.svg') no-repeat center;
    pointer-events: none;
  }
}

.control {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: inherit;
  background: transparent;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.1s;
  }

  &:hover::after,
  &:focus-visible::after,
  &:active::after,
  &[aria-pressed='true']::after {
    opacity: 0.1;
  }

  &:focus-visible {
    outline: 2px solid $theme-accent-focus-default;
    outline-offset: 2px;
  }
}

.modeControl {
  @include color-accent-primary;
}

.modeIcon {
  opacity: 0.3;
  transition: opacity 0.1s;

  .modeControl:hover &,
  .modeControl:focus-visible & {
    opacity: 0.7;
  }

  .modeControl[aria-pressed='true'] & {
    opacity: 1;
  }
}

.closeIcon {
  transform: rotate(180deg);
}

[data-is-mobile] .container {
  right: 0;
  left: 0;
  flex-direction: row;
  width: auto;
  padding: 6px;
  border-radius: 0;

  &::after {
    display: none;
  }
}
</style>
