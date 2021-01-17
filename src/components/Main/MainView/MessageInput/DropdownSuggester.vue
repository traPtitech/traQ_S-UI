<template>
  <div
    :class="$style.container"
    :style="{ top: position.top - 48 + 'px', left: position.left + 60 + 'px' }"
  >
    <!-- <div :class="$style.item" v-for="candidate in candidates" :key="candidate."> -->
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
  width: 80px;
  height: 60px;
  border: solid 2px $theme-ui-tertiary;
}
</style>
