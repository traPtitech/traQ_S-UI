<template>
  <div :class="$style.container" :style="style">
    <div
      :class="$style.item"
      v-for="candidate in candidates"
      :key="candidate"
      @click="onClick(e, candidate)"
    >
      <div :class="$style.name">
        {{ candidate }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'

export default defineComponent({
  name: 'DropdownSuggester',
  // components: {
  //   Icon
  // },
  props: {
    // candidates: {
    //   type: Array as PropType<Candidate[]>,
    //   default: null
    // }
    candidates: {
      type: Array as PropType<string[]>,
      default: []
    },
    position: {
      type: Object as PropType<{ top: number; left: number }>,
      required: true
    }
  },
  emits: {
    select: (word: string) => true
  },
  setup(props, context) {
    const onClick = (_e: MouseEvent, word: string) => {
      context.emit('select', word)
    }

    const style = computed(() => ({
      top: props.position.top + 'px',
      left: props.position.left + 60 + 'px'
    }))

    return {
      style,
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
}
.item {
  padding: 4px;
  cursor: pointer;
  &:first-child {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
  &:hover {
    background-color: $theme-background-secondary;
  }
}
.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
