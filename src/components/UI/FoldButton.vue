<template>
  <button :class="$style.button" :data-background="background">
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

interface Props extends ButtonHTMLAttributes {
  showIcon?: boolean
  background?: 'primary' | 'secondary' | 'tertiary'
  isFold: boolean
}

withDefaults(defineProps<Props>(), {
  showIcon: false,
  background: 'tertiary'
})
</script>

<style lang="scss" module>
.button {
  cursor: pointer;

  display: flex;
  gap: 4px;
  align-items: center;

  font-weight: bold;
  border-radius: 4px;
  padding: 0 24px;
  min-height: 24px;
  font-size: 12px;
  line-height: 1.5;
  width: fit-content;

  color: $theme-text-primary-default;
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
}
</style>
