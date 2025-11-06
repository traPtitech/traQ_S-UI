<template>
  <IconButton
    :class="$style.button"
    icon-mdi
    :icon-name="
      copied
        ? 'clipboard-check-multiple-outline'
        : 'clipboard-text-multiple-outline'
    "
    :title="copied ? 'copied!' : 'copy'"
    @click.stop="copy"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  />
</template>

<script lang="ts" setup>
import { type MaybeRefOrGetter, ref, toValue } from 'vue'

import IconButton from '/@/components/UI/IconButton.vue'
import useHover from '/@/composables/dom/useHover'
import useExecWithToast from '/@/composables/toast/useExecWithToast'

const { contentsSource } = defineProps<{
  contentsSource: MaybeRefOrGetter<string | undefined | null>
}>()

const { execWithToast } = useExecWithToast()
const copied = ref(false)
const { isHovered, onMouseEnter, onMouseLeave: onMouseLeaveImpl } = useHover()

let timeout: NodeJS.Timeout | null = null

const onMouseLeave = () => {
  onMouseLeaveImpl()
  if (!timeout) copied.value = false
}

const copy = async () => {
  const content = toValue(contentsSource)
  if (!content) return

  execWithToast(undefined, 'コピーに失敗しました', async () => {
    await navigator.clipboard.writeText(content)
    copied.value = true

    timeout = setTimeout(() => {
      timeout = null
      if (isHovered.value) return
      copied.value = false
    }, 1500)
  })
}
</script>

<style lang="scss" module>
.button {
  @include color-ui-primary;

  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}
</style>
