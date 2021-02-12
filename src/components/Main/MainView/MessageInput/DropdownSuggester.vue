<template>
  <teleport to="#dropdown-suggester-popup">
    <div v-show="isShow" :class="$style.container" :style="styledPosition">
      <div
        :ref="determinedRef"
        :class="{
          [$style.determined]: true,
          [$style.selected]: -1 === selectedIndex
        }"
      >
        {{ determined }}
      </div>
      <div :class="$style.scroll">
        <div
          :class="{
            [$style.item]: true,
            [$style.selected]: index === selectedIndex
          }"
          v-for="(candidate, index) in candidatesWithId"
          :ref="setItemRef"
          :key="candidate"
          @click="onClick(index)"
          @mousedown="onMousedown"
        >
          <template v-if="candidate.type === 'user'">
            <dropdown-suggester-user-icon :user-id="candidate.id" />
            <div :class="$style.name">
              {{ candidate.word }}
            </div>
          </template>
          <template v-if="candidate.type === 'stamp'">
            <dropdown-suggester-stamp-preview :stamp-id="candidate.id" />
            <div :class="$style.name">
              {{ candidate.word }}
            </div>
          </template>
          <div v-else :class="$style.name">
            {{ candidate.word }}
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, watch, onBeforeUpdate } from 'vue'
import store from '@/store'
import DropdownSuggesterUserIcon from './DropdownSuggesterUserIcon.vue'
import DropdownSuggesterStampPreview from './DropdownSuggesterStampPreview.vue'

export default defineComponent({
  name: 'DropdownSuggester',
  components: {
    DropdownSuggesterUserIcon,
    DropdownSuggesterStampPreview
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object as PropType<{ top: number; left: number }>,
      required: true
    },
    candidates: {
      type: Array as PropType<string[]>,
      default: []
    },
    selectedIndex: {
      type: Number,
      default: -1
    },
    determined: {
      type: String,
      default: ''
    }
  },
  emits: {
    select: (index: number) => true,
    mousedown: () => true
  },
  setup(props, context) {
    const styledPosition = computed(() => ({
      top: props.position?.top + 'px',
      left: props.position?.left + 'px'
    }))
    let itemRefs: HTMLDivElement[] = []
    const setItemRef = (el: HTMLDivElement) => {
      itemRefs.push(el)
    }
    let determinedRef: HTMLDivElement | undefined = undefined
    onBeforeUpdate(() => {
      itemRefs = []
      determinedRef = undefined
    })
    watch(
      () => props.selectedIndex,
      i => {
        if (i === -1) {
          determinedRef?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
          return
        }
        itemRefs[i]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    )
    const candidatesWithId = computed(() =>
      props.candidates.map(word => {
        if (word.startsWith('.')) {
          return {
            type: 'stamp-effect',
            word,
            id: undefined
          }
        }
        if (word.startsWith('@')) {
          const userId = store.getters.entities.userByName(
            [...word].slice(1).join('')
          )?.id
          if (!userId) {
            return {
              type: 'group',
              word,
              id: undefined
            }
          }
          return { type: 'user', word, id: userId }
        }
        if (word.startsWith(':')) {
          const stampId = store.getters.entities.stampByName(
            [...word].slice(1).join('')
          )?.id
          return { type: 'stamp', word, id: stampId }
        }
      })
    )
    const onMousedown = () => {
      context.emit('mousedown')
    }
    const onClick = (index: number) => {
      context.emit('select', index)
    }

    return {
      setItemRef,
      determinedRef,
      styledPosition,
      candidatesWithId,
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
  width: 240px;
  transform: translateY(-100%);
  border: solid 2px $theme-background-secondary;
  border-radius: 4px;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}
.determined {
  padding: 4px;
  border-bottom: 2px solid $theme-background-secondary;
  &.selected,
  &:hover {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
}
.scroll {
  overflow-y: scroll;
  max-height: 144px;
}
.item {
  display: flex;
  padding: 4px;
  cursor: pointer;
  &.selected,
  &:hover {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
}
.name {
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
