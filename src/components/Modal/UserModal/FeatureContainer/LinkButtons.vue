<template>
  <div>
    <link-button
      :class="$style.button"
      :title="`${showTitle ? 'DM' : ''}`"
      icon-name="email"
      icon-mdi
      @mousedown="onDMClick"
    />
    <link-button
      v-if="homeChannelId !== null"
      :class="$style.button"
      :title="`${showTitle ? 'ホーム' : ''}`"
      icon-name="home"
      icon-mdi
      @mousedown="onHomeChannelClick"
    />
  </div>
</template>

<script lang="ts" setup>
import LinkButton from './LinkButton.vue'
import { useOpenLinkAndClearModal } from '../../composables/useOpenLinkFromModal'
import { constructUserPath } from '/@/router'
import useChannelPath from '/@/composables/useChannelPath'

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

  openLinkAndClearModal(event, channelIdToLink(props.homeChannelId))
}
</script>

<style lang="scss" module>
.button {
  margin: 8px 4px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}
</style>
