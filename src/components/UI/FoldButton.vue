<template>
  <button
    :class="[$style.button, small && $style.small]"
    :data-background="background"
  >
    <a-icon
      v-if="showIcon"
      :name="isFold ? 'down' : 'up'"
      :class="$style['icon']"
    />
    {{ isFold ? 'さらに表示' : '折りたたむ' }}
  </button>
</template>

<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import AIcon from '/@/components/UI/AIcon.vue'

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  showIcon?: boolean
  background?: 'primary' | 'secondary' | 'tertiary' | 'none'
  isFold: boolean
  small?: boolean
}

withDefaults(defineProps<Props>(), {
  showIcon: false,
  background: 'tertiary',
  small: false
})
</script>

<style lang="scss" module>
.button {
  @include color-text-primary;
  @include size-caption;

  cursor: pointer;

  display: flex;
  gap: 4px;
  align-items: center;

  font-weight: bold;
  border-radius: 4px;
  padding: 0 24px;
  &.small {
    padding: 0 8px;
  }

  min-height: 24px;
  line-height: 1.5;
  width: fit-content;

  &[data-background='primary'] {
    background-color: $theme-ui-primary-default;
  }
  &[data-background='secondary'] {
    background-color: $theme-ui-secondary-default;
  }
  &[data-background='tertiary'] {
    background-color: $theme-ui-tertiary-default;
  }

  .icon {
    margin-left: -12px;
  }
  &.small .icon {
    margin-left: -4px;
  }
}
</style>
