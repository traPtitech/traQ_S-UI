<template>
  <button :class="$style.container" @click="toMessage"><slot /></button>
</template>

<script lang="ts" setup>
import { useOpenLink } from '/@/composables/useOpenLink'
import { constructMessagesPath } from '/@/router'

const props = defineProps<{
  messageId: string
}>()

const { openLink } = useOpenLink()

const toMessage = async (e: MouseEvent) => {
  openLink(e, constructMessagesPath(props.messageId))
}
</script>

<style lang="scss" module>
.container {
  @include color-ui-primary;
  display: flex;
  cursor: pointer;
  padding: 12px 20px;
  &:hover {
    @include background-secondary;
  }
}
.label {
  font: {
    size: 1rem;
  }
}
</style>
