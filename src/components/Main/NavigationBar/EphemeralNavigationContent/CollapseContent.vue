<template>
  <div :class="$style.container">
    <div
      :class="$style.expandButton"
      :data-is-expanded="$boolAttr(isExpanded)"
      @click="toggleExpanded"
    >
      <a-icon :class="$style.expandIcon" name="chevron-up" mdi />
    </div>
    <div :class="$style.list" :data-is-expanded="$boolAttr(isExpanded)">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AIcon from '/@/components/UI/AIcon.vue'
import useToggle from '/@/composables/utils/useToggle'

const { value: isExpanded, toggle: toggleExpanded } = useToggle(false)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
  flex: 1 1;
  min-height: 0;
}
.expandButton {
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.expandIcon {
  @include color-ui-primary;
  transform: rotate(0);
  transition: transform 0.5s;
  .expandButton[data-is-expanded] & {
    transform: rotate(0.5turn);
  }
}
.list {
  padding: 0 12px 8px 12px;
  max-height: 120px;
  overflow: scroll;
  transition: 0.5s max-height ease-out;
  &[data-is-expanded] {
    max-height: 600px;
  }
}
</style>
