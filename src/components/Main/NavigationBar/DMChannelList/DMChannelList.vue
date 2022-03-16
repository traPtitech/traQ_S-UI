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

<script lang="ts" setup>
import DMChannelElement from './DMChannelElement.vue'
import { DMChannel } from '@traptitech/traq'
import { DMChannelId } from '/@/types/entity-ids'
import { useOpenLink } from '/@/composables/useOpenLink'
import { constructUserPath } from '/@/router'
import { useChannelsStore } from '/@/store/entities/channels'
import { useUsersStore } from '/@/store/entities/users'

withDefaults(
  defineProps<{
    dmChannels?: DMChannel[]
  }>(),
  {
    dmChannels: () => []
  }
)

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
</script>

<style lang="scss" module>
.element {
  margin: 4px 0;
}
</style>
