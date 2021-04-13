<template>
  <teleport to="#dropdown-suggester-popup">
    <div v-show="isShown" :class="$style.container" :style="styledPosition">
      <div
        :class="[$style.item, $style.confirmedPart]"
        :aria-selected="selectedIndex === -1"
        @mousedown="onMousedown"
        @click="onClick(-1)"
      >
        {{ confirmedPart }}
      </div>
      <div :class="$style.scroll">
        <div
          v-for="(candidate, index) in candidates"
          :ref="setItemRef"
          :key="candidate"
          :class="$style.item"
          :aria-selected="selectedIndex === index"
          @mousedown="onMousedown"
          @click="onClick(index)"
        >
          <dropdown-suggester-user-icon
            v-if="candidate.type === 'user'"
            :user-id="candidate.id"
          />
          <stamp-element
            v-else-if="candidate.type === 'stamp'"
            :stamp-id="candidate.id"
            :size="24"
          />
          <div :class="$style.name">
            {{ candidate.text }}
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, watch, onBeforeUpdate } from 'vue'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'
import StampElement from '@/components/UI/Stamp.vue'
import { Word } from '@/lib/trieTree'

const WIDTH = 240
const MARGIN = 8

export default defineComponent({
  name: 'DropdownSuggester',
  components: {
    DropdownSuggesterUserIcon,
    StampElement
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

    let itemRefs: HTMLDivElement[] = []
    const setItemRef = (el: HTMLDivElement) => {
      itemRefs.push(el)
    }
    onBeforeUpdate(() => {
      itemRefs = []
    })

    watch(
      () => props.selectedIndex,
      i => {
        if (i === -1) return
        itemRefs[i]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    )

    const onMousedown = () => {
      context.emit('mousedown')
    }
    const onClick = (index: number) => {
      context.emit('select', index)
    }

    return {
      setItemRef,
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
}
.item {
  display: flex;
  padding: 4px;
  cursor: pointer;
  &[aria-selected='true'],
  &:hover {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
}
.confirmedPart {
  border-bottom: 2px solid $theme-background-secondary;
}
.name {
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
