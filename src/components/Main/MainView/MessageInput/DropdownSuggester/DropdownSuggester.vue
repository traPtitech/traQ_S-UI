<template>
  <teleport to="#dropdown-suggester-popup">
    <div v-show="isShown" :class="$style.container" :style="styledPosition">
      <dropdown-suggester-candidate
        :candidate="{ text: confirmedPart }"
        :is-selected="selectedIndex === -1"
        @mousedown="onMousedown"
        @click="onClick(-1)"
      />
      <div :class="$style.scroll">
        <dropdown-suggester-candidate
          v-for="(candidate, index) in candidates"
          :key="candidate.text"
          :candidate="candidate"
          :is-selected="selectedIndex === index"
          @mousedown="onMousedown"
          @click="onClick(index)"
        />
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import DropdownSuggesterCandidate from './DropdownSuggesterCandidate.vue'
import { Word } from '@/lib/trieTree'

const WIDTH = 240
const MARGIN = 8

export default defineComponent({
  name: 'DropdownSuggester',
  components: {
    DropdownSuggesterCandidate
  },
  props: {
    isShown: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object as PropType<{ top: number; left: number }>,
      default: () => ({ top: 0, left: 0 })
    },
    candidates: {
      type: Array as PropType<Word[]>,
      default: () => []
    },
    /**
     * 選択されている候補
     * `-1`のときは確定部分までという候補
     * `0`以上は通常の候補
     */
    selectedIndex: {
      type: Number,
      default: -1
    },
    confirmedPart: {
      type: String,
      default: ''
    }
  },
  emits: {
    select: (_index: number) => true,
    mousedown: () => true
  },
  setup(props, context) {
    const styledPosition = computed(() => ({
      top: `${props.position.top}px`,
      left: `min(${props.position.left}px, calc(100vw - ${WIDTH + MARGIN}px))`,
      width: `${WIDTH}px`
    }))

    const onMousedown = () => {
      context.emit('mousedown')
    }
    const onClick = (index: number) => {
      context.emit('select', index)
    }

    return {
      styledPosition,
      onMousedown,
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
  transform: translateY(-100%);
  border: solid 2px $theme-background-secondary;
  border-radius: 4px;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}
.scroll {
  overflow-y: scroll;
  max-height: 32px * 4.5;
  border-top: 2px solid $theme-background-secondary;
}
</style>
