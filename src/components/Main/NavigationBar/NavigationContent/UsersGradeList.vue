<template>
  <div>
    <users-separator
      :name="name"
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

<script lang="ts">
import { ref, computed } from 'vue';
import { User } from '@traptitech/traq'
import { isDefined } from '/@/lib/basic/array'
import { useMeStore } from '/@/store/domain/me'
import { useChannelsStore } from '/@/store/entities/channels'

const useFolding = () => {
  const isFolding = ref(true)
  const toggleFolding = () => {
    isFolding.value = !isFolding.value
  }

  return { isFolding, toggleFolding }
}
</script>

<script lang="ts" setup>
import UsersSeparator from './UsersSeparator.vue';
import UsersElement from './UsersElement.vue';
import SlideDown from '/@/components/UI/SlideDown.vue';

const props = defineProps<{
    name: string,
    users: User[]
}>();

const { unreadChannelsMap } = useMeStore()
const { userIdToDmChannelIdMap } = useChannelsStore()
const { isFolding, toggleFolding } = useFolding()

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
