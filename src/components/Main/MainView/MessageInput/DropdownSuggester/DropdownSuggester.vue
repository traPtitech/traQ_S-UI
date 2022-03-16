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
import { computed } from 'vue';
import { Word } from '../composables/useWordSuggestionList'
import { WordOrConfirmedPart } from '../composables/useWordSuggester'
import { isIOS } from '/@/lib/dom/browser'

const WIDTH = 240
const MARGIN = 8

const iOSFlag = isIOS()
</script>

<script lang="ts" setup>
import DropdownSuggesterCandidate from './DropdownSuggesterCandidate.vue';

const props = withDefaults(defineProps<{
    isShown?: boolean,
    position?: { top: number; left: number },
    candidates?: Word[],
    selectedIndex: number | null,
    confirmedPart?: string
}>(), {
    isShown: false,
    position: () => ({ top: 0, left: 0 }),
    candidates: () => [],
    confirmedPart: ''
});

const emit = defineEmits<{
    (e: "select", _word: WordOrConfirmedPart): void
}>();

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
</script>

<style lang="scss" module>
.container {
  @include color-ui-secondary;
  @include background-primary;
  position: absolute;
  transform: translateY(-100%);
  border: solid 2px $theme-background-secondary-border;
  border-radius: 4px;
  filter: $common-drop-shadow-default;
  z-index: $z-index-word-suggester;
}
.scroll {
  overflow-y: scroll;
  max-height: 32px * 4.5;
  border-top: 2px solid $theme-background-secondary-border;
}
</style>
