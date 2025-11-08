<template>
  <IconButton
    :class="$style.button"
    icon-mdi
    icon-name="content-copy"
    title="copy"
    @click.stop="copy"
  />
</template>

<script lang="ts" setup>
import { type MaybeRefOrGetter, toValue } from 'vue'

import IconButton from '/@/components/UI/IconButton.vue'
import useCopyText from '/@/composables/toast/useCopyText'

const { contentsSource, description } = defineProps<{
  contentsSource: MaybeRefOrGetter<string | undefined | null>
  description?: string
}>()

const { copyText } = useCopyText()

const copy = async () => {
  const content = toValue(contentsSource)
  if (!content) return

  copyText(content, description)
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
