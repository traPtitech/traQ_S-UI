<template>
  <div :aria-expanded="!isFolding">
    <users-separator
      :name="nameWithCount"
      :is-open="!isFolding"
      :has-notification="hasNotification"
      :class="$style.separator"
      @click="toggleFolding"
    />
    <slide-down :class="$style.users" :is-open="!isFolding">
      <users-element v-for="user in users" :key="user.id" :user="user" />
    </slide-down>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { User } from '@traptitech/traq'
import { isDefined } from '/@/lib/basic/array'
import { useChannelsStore } from '/@/store/entities/channels'
import UsersSeparator from './UsersSeparator.vue'
import UsersElement from './UsersElement.vue'
import SlideDown from '/@/components/UI/SlideDown.vue'
import useToggle from '/@/composables/utils/useToggle'
import { useSubscriptionStore } from '/@/store/domain/subscription'

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
