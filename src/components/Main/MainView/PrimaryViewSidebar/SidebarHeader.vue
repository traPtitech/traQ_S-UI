<template>
  <h2 :class="$style.title">
    <a-icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    <span v-else-if="iconString" :class="$style.iconString">{{
      iconString
    }}</span>
    <span :class="$style.text">{{ text }}</span>
  </h2>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

withDefaults(
  defineProps<{
    iconString?: string
    iconName?: string
    iconMdi?: boolean
    text: string
  }>(),
  {
    iconMdi: false
  }
)
</script>

<style lang="scss" module>
.title {
  @include color-ui-primary;
  @include size-h2;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  // 中身のtext-overflow: ellipsis用
  min-width: 0;
}

.icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.iconString {
  margin-right: 0.125rem;
  user-select: none;
}

.text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
