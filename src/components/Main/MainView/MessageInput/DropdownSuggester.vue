<template>
  <div :class="$style.container">
    <div
      :class="{
        [$style.item]: true,
        [$style.selected]: index === currentIndex
      }"
      v-for="(candidate, index) in candidatesWithId"
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
      <template v-else :class="$style.name">
        {{ candidate.word }}
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
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
    const candidatesWithId = computed(() =>
      props.candidates.map(word => {
        if ([...word][0] !== '@')
          return {
            isUser: false,
            word,
            userId: ''
          }
        const userId = store.getters.entities.userByName(
          [...word].slice(1).join('')
        )?.id
        if (!userId)
          return {
            isUser: false,
            word,
            userId: ''
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
  &:first-child,
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
