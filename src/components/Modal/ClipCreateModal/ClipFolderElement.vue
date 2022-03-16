<template>
  <div :class="$style.container" :aria-selected="isSelected">
    <a-icon :class="$style.icon" mdi :name="iconName" />
    <span>{{ folderName }}</span>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    folderName: string,
    isSelected?: boolean
}>(), {
    isSelected: false
});

const iconName = computed(() =>
  props.isSelected ? 'bookmark-check' : 'bookmark'
)
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}
.icon {
  @include color-ui-primary;
  margin-right: 8px;
  .container[aria-selected='true'] & {
    @include color-accent-primary;
  }
}
</style>
