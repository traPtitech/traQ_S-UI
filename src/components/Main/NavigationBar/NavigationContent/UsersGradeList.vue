<template>
  <div :aria-expanded="!isFolding">
    <UsersSeparator
      :name="nameWithCount"
      :is-open="!isFolding"
      :has-notification="hasNotification"
      :class="$style.separator"
      @click="toggleFolding"
    />
    <SlideDown :class="$style.users" :is-open="!isFolding">
      <UsersElement v-for="user in users" :key="user.id" :user="user" />
    </SlideDown>
  </div>
</template>

<script lang="ts" setup>
import type { User } from '@traptitech/traq'

import { computed } from 'vue'

import SlideDown from '/@/components/UI/SlideDown.vue'
import useToggle from '/@/composables/utils/useToggle'
import { isDefined } from '/@/lib/basic/array'
import { useSubscriptionStore } from '/@/store/domain/subscription'
import { useChannelsStore } from '/@/store/entities/channels'

import UsersElement from './UsersElement.vue'
import UsersSeparator from './UsersSeparator.vue'

const props = defineProps<{
  name: string
  users: User[]
}>()

const nameWithCount = computed(() => `${props.name} (${props.users.length})`)

const { unreadChannelsMap } = useSubscriptionStore()
const { userIdToDmChannelIdMap } = useChannelsStore()
const { value: isFolding, toggle: toggleFolding } = useToggle(true)

const dmChannelIds = computed(() =>
  props.users
    .map(user => userIdToDmChannelIdMap.value.get(user.id))
    .filter(isDefined)
)
const hasNotification = computed(() =>
  dmChannelIds.value.some(id => unreadChannelsMap.value.has(id))
)
</script>

<style lang="scss" module>
.separator {
  cursor: pointer;
}
.users {
  contain: content;
}
</style>
