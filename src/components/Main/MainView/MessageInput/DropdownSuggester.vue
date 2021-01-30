<template>
  <div :class="$style.container">
    <div
      :class="{
        [$style.item]: true,
        [$style.selected]: index === currentIndex
      }"
      v-for="(candidate, index) in candidates"
      :key="candidate"
      @click="onClick(index)"
    >
      <div :class="$style.name">
        {{ candidate }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'DropdownSuggester',
  props: {
    candidates: {
      type: Array as PropType<string[]>,
      default: []
    },
    currentIndex: {
      type: Number,
      default: -1
    }
  },
  emits: {
    select: (index: number) => true
  },
  setup(props, context) {
    const onClick = (index: number) => {
      context.emit('select', index)
    }

    return {
      onClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  position: absolute;
  background: $theme-background-primary;
  width: 240px;
  max-height: 160px;
  transform: translateY(-100%);
  border: solid 2px $theme-background-secondary;
  border-radius: 4px;
  overflow-y: scroll;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}
.item {
  padding: 4px;
  cursor: pointer;
  &.selected,
  &:first-child,
  &:hover {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
}
.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
