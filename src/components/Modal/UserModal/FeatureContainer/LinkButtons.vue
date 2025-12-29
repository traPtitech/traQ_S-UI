<template>
  <div :class="$style.container">
    <LinkButton
      :title="`${showTitle ? 'DM' : ''}`"
      icon-name="email"
      icon-mdi
      @mousedown="onDMClick"
    />
    <LinkButton
      v-if="homeChannelId !== null"
      :title="`${showTitle ? 'ホーム' : ''}`"
      icon-name="home"
      icon-mdi
      @mousedown="onHomeChannelClick"
    />
  </div>
</template>

<script lang="ts" setup>
import useChannelPath from '/@/composables/useChannelPath'
import { constructUserPath } from '/@/router'

import { useOpenLinkAndClearModal } from '../../composables/useOpenLinkFromModal'
import LinkButton from './LinkButton.vue'

const props = withDefaults(
  defineProps<{
    homeChannelId?: string | null
    userName: string
    showTitle?: boolean
  }>(),
  {
    showTitle: false
  }
)

const { openLinkAndClearModal } = useOpenLinkAndClearModal()
const { channelIdToLink } = useChannelPath()

const onDMClick = async (event: MouseEvent) => {
  openLinkAndClearModal(event, constructUserPath(props.userName))
}

const onHomeChannelClick = async (event: MouseEvent) => {
  if (!props.homeChannelId) return
  openLinkAndClearModal(event, channelIdToLink(props.homeChannelId) as string)
}
</script>

<style lang="scss" module>
.container {
  display: flex;
  gap: 4px;
  justify-content: center;
}
</style>
