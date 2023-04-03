<template>
  <div
    v-if="isLong"
    :class="[$style.wrap]"
    :data-is-fold="isFold"
    @click="unfold"
  >
    <div ref="preWrapRef" :class="wrapClass" v-html="preContent.outerHTML" />
    <fold-button
      show-icon
      :is-fold="isFold"
      :class="$style.button"
      :aria-controls="foldBlockId"
      :aria-expanded="!isFold"
      @click="toggle"
    />
  </div>
  <div
    v-else
    ref="preWrapRef"
    :class="wrapClass"
    v-html="preContent.outerHTML"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import FoldButton from '/@/components/UI/FoldButton.vue'
import { randomString } from '/@/lib/basic/randomString'

const MAX_LINES = 5

const props = defineProps<{
  wrapClass?: string
  preContent: HTMLPreElement
}>()

const isFold = ref(true)

const line_count = computed(() => {
  const content = props.preContent.textContent
  if (content === null) return 0
  const lines = content.split('\n')
  return lines.length - (lines.at(-1) === '' ? 1 : 0) // 末尾の改行は行数に含めない
})

const isLong = computed(() => {
  return line_count.value > MAX_LINES
})

const preWrapRef = ref<HTMLDivElement>()

const foldBlockId = randomString()
const applyId = () => {
  if (!isLong.value) return
  if (preWrapRef.value === undefined) return
  const pre = preWrapRef.value.querySelector('pre')
  if (pre === null) return
  pre.id = foldBlockId
}
onMounted(applyId)

const unfold = (e: MouseEvent) => {
  if (!isFold.value) return
  isFold.value = false
  e.stopPropagation()
}
const toggle = (e: MouseEvent) => {
  isFold.value = !isFold.value
  e.stopPropagation()
}
</script>

<style lang="scss" module>
.wrap {
  position: relative;
  overflow: hidden;
  pre {
    margin-bottom: 0;
  }
  margin-bottom: 16px;

  &[data-is-fold='true'] {
    cursor: pointer;

    pre {
      max-height: calc(6em + 32px);
      -webkit-mask-image: linear-gradient(black 0% 60%, transparent 100%);
      mask-image: linear-gradient(black 0% 60%, transparent 100%);
    }
    background: var(--markdown-code-background);
  }
  &[data-is-fold='false'] {
    pre {
      padding-bottom: 16px;
    }
  }

  .button {
    position: absolute;
    bottom: 8px;
    margin: auto;
    left: 0;
    right: 0;

    transition: all 0.15s ease-out;
  }

  @media (any-hover: hover) {
    .button {
      transform: translateY(-8px);
      opacity: 0;
    }

    &:hover {
      .button {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
}
</style>
