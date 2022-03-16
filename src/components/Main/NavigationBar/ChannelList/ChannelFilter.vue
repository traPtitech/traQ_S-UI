<template>
  <div :class="$style.container">
    <div :class="$style.input">
      <filter-input v-model="value" on-secondary disable-ime />
    </div>
    <button
      :class="$style.star"
      :aria-selected="isStared"
      @click="toggleStarFilter"
    >
      <a-icon :class="$style.icon" name="star" :width="22" :height="22" mdi />
    </button>
  </div>
</template>

<script lang="ts" setup>
import FilterInput from '/@/components/UI/FilterInput.vue';
import AIcon from '/@/components/UI/AIcon.vue';
import { useModelValueSyncer } from '/@/composables/useModelSyncer'

const props = withDefaults(defineProps<{
    modelValue: string,
    isStared?: boolean
}>(), {
    isStared: false
});

const emit = defineEmits<{
    (e: "update:modelValue", _val: string): void,
    (e: "toggleStarFilter"): void
}>();

const value = useModelValueSyncer(props, emit)
const toggleStarFilter = () => {
  emit('toggleStarFilter')
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.input {
  margin-right: 16px;
}
.star {
  @include background-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 4px;
  margin-right: 16px;
  cursor: pointer;
}
.icon {
  @include color-ui-secondary-inactive;
  .star[aria-selected='true'] & {
    @include color-accent-primary;
  }
}
</style>
