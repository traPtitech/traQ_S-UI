<template>
  <div>
    <account-state :class="$style.section" :state="user.state" />
    <bio-text :class="$style.section" :bio="detail?.bio" />
    <home-channel :channel-id="detail?.homeChannel" :class="$style.section" />
    <account-list
      :class="$style.section"
      :bot="user.bot"
      :name="user.name"
      :twitter-id="detail?.twitterId"
    />
    <last-online
      :class="$style.section"
      :last-online="isOnline ? 'オンライン中' : detail?.lastOnline ?? undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import AccountState from './AccountState.vue'
import BioText from './BioText.vue'
import HomeChannel from './HomeChannel.vue'
import AccountList from './AccountList.vue'
import LastOnline from './LastOnline.vue'
import type { User, UserDetail } from '@traptitech/traq'
import { useOnlineUsers } from '/@/store/domain/onlineUsers'
import { computed } from 'vue'

const props = defineProps<{
  user: User
  detail?: UserDetail
}>()

const { onlineUsers, fetchOnlineUsers } = useOnlineUsers()
fetchOnlineUsers()
const isOnline = computed(() => onlineUsers.value.has(props.user.id))
</script>

<style lang="scss" module>
.section {
  margin: 16px 0;
  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
