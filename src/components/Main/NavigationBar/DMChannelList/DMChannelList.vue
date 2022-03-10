<template>
  <div>
    <d-m-channel-element
      v-for="dmChannel in dmChannels"
      :key="dmChannel.id"
      :class="$style.element"
      :dm-channel="dmChannel"
      @channel-select="onChannelSelect"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { DMChannel } from '@traptitech/traq'
import DMChannelElement from './DMChannelElement.vue'
import { DMChannelId } from '/@/types/entity-ids'
import { useOpenLink } from '/@/use/openLink'
import { constructUserPath } from '/@/router'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'

export default defineComponent({
  name: 'DMChannelList',
  components: {
    DMChannelElement
  },
  props: {
    dmChannels: {
      type: Array as PropType<DMChannel[]>,
      default: () => []
    }
  },
  setup() {
    const { dmChannelsMap } = useChannelsStore()
    const { usersMap } = useUsersStore()
    const { openLink } = useOpenLink()

    const onChannelSelect = (event: MouseEvent, id: DMChannelId) => {
      const userId = dmChannelsMap.value.get(id)?.userId
      if (!userId) return
      const username = usersMap.value.get(userId)?.name
      if (!username) return

      openLink(event, constructUserPath(username))
    }

    return { onChannelSelect }
  }
})
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
