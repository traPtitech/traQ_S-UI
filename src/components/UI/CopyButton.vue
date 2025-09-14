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
    @click="copy"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  />
</template>

<script lang="ts" setup>
import { ref, toValue, type MaybeRefOrGetter } from 'vue'
import IconButton from '/@/components/UI/IconButton.vue'
import useHover from '/@/composables/dom/useHover'
import useExecWithToast from '/@/composables/toast/useExecWithToast'
import { isTouchDevice } from '/@/lib/dom/browser'

const { contentsSource } = defineProps<{
  contentsSource: MaybeRefOrGetter<string | undefined | null>
}>()

const { execWithToast } = useExecWithToast()
const copied = ref(false)
const { isHovered, onMouseEnter, onMouseLeave: onMouseLeaveImpl } = useHover()

let timeout: ReturnType<typeof setTimeout> | null = null

const onMouseLeave = () => {
  onMouseLeaveImpl()
  if (!timeout) copied.value = false
}

const copy = async (e: MouseEvent) => {
  e.stopPropagation()

  const content = toValue(contentsSource)
  if (!content) return

  execWithToast(undefined, 'コピーに失敗しました', async () => {
    await navigator.clipboard.writeText(content)
    copied.value = true

    timeout = setTimeout(() => {
      timeout = null
      if (!isTouchDevice() && isHovered.value) return
      copied.value = false
    }, 1500)
  })
}
</script>

<style lang="scss" module>
.button {
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}
</style>
