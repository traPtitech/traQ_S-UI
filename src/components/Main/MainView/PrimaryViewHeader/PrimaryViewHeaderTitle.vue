<template>
  <div :class="$style.container">
    <a-icon
      v-if="iconName"
      :class="$style.icon"
      :name="iconName"
      :mdi="iconMdi"
    />
    <h1 :class="$style.title">
      {{ title }}
    </h1>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'

defineProps<{
  iconMdi?: boolean
  iconName?: string
  title: string
}>()
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.title {
  @include size-h1;
}
</style>
