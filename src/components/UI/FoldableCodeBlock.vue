<template>
  <div
    v-if="isLong"
    :class="[$style.wrap]"
    :data-is-fold="isFold"
    @click="unfold"
  >
    <div :class="wrapClass" v-html="preContent.outerHTML" />
    <button :class="[$style.button, $style['fold-button']]" @click="fold">
      折りたたむ ↑
    </button>
    <button :class="[$style.button, $style['unfold-button']]" @click="unfold">
      クリックして展開 ↓
    </button>
  </div>
  <div v-else :class="wrapClass" v-html="preContent.outerHTML" />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const MAX_LINES = 6

const props = defineProps<{
  wrapClass?: string
  preContent: HTMLPreElement
}>()

const isFold = ref(true)

const isLong = computed(() => {
  const content = props.preContent.textContent
  if (content === null) return false
  const lines = content.split('\n')
  return lines.length > MAX_LINES
})

const unfold = (e: MouseEvent) => {
  if (!isFold.value) return
  isFold.value = false
  e.stopPropagation()
}
const fold = (e: MouseEvent) => {
  if (isFold.value) return
  isFold.value = true
  e.stopPropagation()
}
</script>

<style lang="scss" module>
.wrap {
  position: relative;
  overflow: hidden;
  &[data-is-fold='true'] {
    cursor: pointer;

    pre {
      max-height: calc(6em + 32px);
      -webkit-mask-image: linear-gradient(black 0% 40%, transparent 100%);
      mask-image: linear-gradient(black 0% 40%, transparent 100%);
    }
    box-shadow: 0 0 0 2px var(--markdown-code-background) inset;
  }

  .button {
    display: block;
    cursor: pointer;
    position: absolute;
    bottom: 24px;
    margin: auto;
    left: 0;
    right: 0;
    background-color: $theme-ui-secondary-default;
    color: $theme-background-primary-default;
    border-radius: 9999999px;
    padding: 4px 12px;
    width: fit-content;

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

  &[data-is-fold='true'] {
    .fold-button {
      display: none;
    }
  }
  &[data-is-fold='false'] {
    .unfold-button {
      display: none;
    }
  }
}
</style>
