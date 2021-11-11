<template>
  <teleport to="#dropdown-suggester-popup">
    <!--
      iOSではうまく動かないので非表示
      https://github.com/traPtitech/traQ_S-UI/issues/2088
    -->
    <div
      v-if="!iOSFlag && isShown"
      :class="$style.container"
      :style="styledPosition"
    >
      <!--
        mousedownイベントでやっているのはclickイベントだとフォーカスが外れるため
        preventをすることでclickイベントでフォーカスが外れるのを回避している
      -->
      <dropdown-suggester-candidate
        :candidate="confirmedPartCandidate"
        :is-selected="selectedIndex === -1"
        @mousedown.prevent="select(confirmedPartCandidate)"
      />
      <div :class="$style.scroll">
        <dropdown-suggester-candidate
          v-for="(candidate, index) in candidates"
          :key="candidate.text"
          :candidate="candidate"
          :is-selected="selectedIndex === index"
          @mousedown.prevent="select(candidate)"
        />
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import DropdownSuggesterCandidate from './DropdownSuggesterCandidate.vue'
import { Word } from '../use/wordSuggestionList'
import { WordOrConfirmedPart } from '../use/wordSuggester'
import { isIOS } from '/@/lib/dom/browser'

const WIDTH = 240
const MARGIN = 8

const iOSFlag = isIOS()

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
     * ../use/wordSuggester.tsを参照
     */
    selectedIndex: {
      // nullableのとき https://github.com/vuejs/vue-next/issues/3948
      type: null as unknown as PropType<number | null>,
      required: true
    },
    confirmedPart: {
      type: String,
      default: ''
    }
  },
  emits: {
    select: (_word: WordOrConfirmedPart) => true
  },
  setup(props, { emit }) {
    const styledPosition = computed(() => ({
      top: `${props.position.top}px`,
      left: `min(${props.position.left}px, calc(100vw - ${WIDTH + MARGIN}px))`,
      width: `${WIDTH}px`
    }))

    const confirmedPartCandidate = computed(
      (): WordOrConfirmedPart => ({
        type: 'confirmed-part',
        text: props.confirmedPart
      })
    )

    const select = (word: WordOrConfirmedPart) => {
      emit('select', word)
    }

    return {
      iOSFlag,
      styledPosition,
      confirmedPartCandidate,
      select
    }
  }
})
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-primary;
  position: absolute;
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
