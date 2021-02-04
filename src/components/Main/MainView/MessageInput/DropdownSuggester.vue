<template>
  <teleport to="#dropdown-suggester-popup">
    <div v-show="isShow" :class="$style.container" :style="styledPosition">
      <div
        :class="{
          [$style.item]: true,
          [$style.selected]: index === selectedIndex
        }"
        v-for="(candidate, index) in candidatesWithId"
        :ref="setItemRef"
        :key="candidate"
        @click="onClick(index)"
      >
        <template v-if="candidate.isUser">
          <user-icon :user-id="candidate.userId" :size="24" />
          <online-indicator
            :class="$style.indicator"
            :user-id="candidate.userId"
            :size="8"
          />
          <div :class="$style.name">
            {{ candidate.word }}
          </div>
        </template>
        <div v-else :class="$style.name">
          {{ candidate.word }}
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, watch, onBeforeUpdate } from 'vue'
import store from '@/store'
import UserIcon from '@/components/UI/UserIcon.vue'
import OnlineIndicator from '@/components/UI/OnlineIndicator.vue'

export default defineComponent({
  name: 'DropdownSuggester',
  components: {
    UserIcon,
    OnlineIndicator
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
    }
  },
  emits: {
    select: (index: number) => true
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
    onBeforeUpdate(() => {
      itemRefs = []
    })
    watch(
      () => props.selectedIndex,
      i => {
        if (i === -1) return
        itemRefs[i]?.scrollIntoView()
      }
    )

    const candidatesWithId = computed(() =>
      props.candidates.map(word => {
        if (!word.startsWith('@'))
          return {
            isUser: false,
            word,
            userId: undefined
          }
        const userId = store.getters.entities.userByName(
          [...word].slice(1).join('')
        )?.id
        if (!userId)
          return {
            isUser: false,
            word,
            userId: undefined
          }
        return {
          isUser: true,
          word,
          userId
        }
      })
    )

    const onClick = (index: number) => {
      context.emit('select', index)
    }

    return {
      setItemRef,
      styledPosition,
      candidatesWithId,
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
  display: flex;
  padding: 4px;
  cursor: pointer;
  &.selected,
  &:hover {
    background-color: $theme-background-secondary;
    font-weight: bold;
  }
}
.indicator {
  flex-shrink: 0;
}
.name {
  margin-left: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
