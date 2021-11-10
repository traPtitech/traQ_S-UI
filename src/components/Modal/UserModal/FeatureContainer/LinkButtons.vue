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
      v-if="homeChannelId"
      :class="$style.button"
      :title="`${showTitle ? 'ホーム' : ''}`"
      icon-name="home"
      icon-mdi
      @mousedown="onHomeChannelClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LinkButton from './LinkButton.vue'
import { useOpenLinkAndClearModal } from '../../use/openLinkFromModal'
import { constructUserPath } from '/@/router'
import useChannelPath from '/@/use/channelPath'

export default defineComponent({
  name: 'LinkButtons',
  components: {
    LinkButton
  },
  props: {
    homeChannelId: {
      type: String,
      default: undefined
    },
    userName: {
      type: String,
      required: true
    },
    showTitle: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const { openLinkAndClearModal } = useOpenLinkAndClearModal()
    const { channelIdToLink } = useChannelPath()

    const onDMClick = async (event: MouseEvent) => {
      openLinkAndClearModal(event, constructUserPath(props.userName))
    }

    const onHomeChannelClick = async (event: MouseEvent) => {
      if (!props.homeChannelId) return

      openLinkAndClearModal(event, channelIdToLink(props.homeChannelId))
    }

    return {
      onDMClick,
      onHomeChannelClick
    }
  }
})
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
