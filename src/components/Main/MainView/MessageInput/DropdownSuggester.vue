<template>
  <div
    :class="$style.container"
    :style="{ top: position.top - 152 + 'px', left: position.left + 60 + 'px' }"
  >
    <div
      :class="$style.item"
      v-for="(candidate, index) in candidates"
      :key="index"
    >
      {{ candidate }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import Icon from '@/components/UI/Icon.vue'

// const useClickHandlers = (
//   context: SetupContext
// ) => {
//   const onClick = (text: string) => {
//     context.emit('selected', text)
//   }
//   return { onClick }
// }

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
      type: Object as PropType<{ top: number; left: number }>
    }
  },
  setup(props, context) {
    // const { onClick } = useClickHandlers(
    //   context
    // )

    // TODO: styleが動かん、書き方間違えてるかも
    // const style = computed(() => ({
    //   top: props.position?.top + 'px',
    //   left: props.position?.left + 'px'
    // }))

    return {
      // style
      // onClick
    }
  }
})
</script>

<style lang="scss" module>
.container {
  // --top: 0px;
  // --left: 0px;

  @include color-ui-secondary;
  position: absolute;
  // top: var(--top);
  // left: var(--left);
  background: $theme-background-primary;
  color: $theme-ui-primary;
  width: 240px;
  height: 160px;
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
}
</style>
