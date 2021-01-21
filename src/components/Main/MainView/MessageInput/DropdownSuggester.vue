<template>
  <div :class="$style.container" :style="style">
    <div
      :class="$style.item"
      v-for="candidate in candidates"
      :key="candidate"
      @click="onClick(e, candidate)"
    >
      {{ candidate }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, computed, PropType } from 'vue'
import Icon from '@/components/UI/Icon.vue'

// スタンプのプレビュー表示とか用(wordCompleterからexportしたほうが良さそう)
// interface Candidate {
//   text: string
//   type:
// }

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
      top: (props.position.top < 150 ? props.position.top : 150) + 'px', // textarea = max-height: 160px, overflow: scroll
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
  color: $theme-ui-primary;
  width: 240px;
  max-height: 160px;
  transform: translateY(-95%);
  border: solid 2px $theme-background-secondary;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: scroll;
  padding: 8px;
}
.item {
  width: fit-content;
  max-width: 200px;
  cursor: pointer;
  &:first-child {
    font-weight: bold;
  }
}
</style>
