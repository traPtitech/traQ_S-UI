<template>
  <div>
    <AccountState :class="$style.section" :state="user.state" />
    <BioText :class="$style.section" :bio="detail?.bio" />
    <HomeChannel :channel-id="detail?.homeChannel" :class="$style.section" />
    <AccountList
      :class="$style.section"
      :bot="user.bot"
      :name="user.name"
      :twitter-id="detail?.twitterId"
    />
    <LastOnline :class="$style.section" :last-online="lastOnline" />
  </div>
</template>

<script lang="ts" setup>
import type { User, UserDetail } from '@traptitech/traq'

import { computed } from 'vue'

import { useOnlineUsers } from '/@/store/domain/onlineUsers'

import AccountList from './AccountList.vue'
import AccountState from './AccountState.vue'
import BioText from './BioText.vue'
import HomeChannel from './HomeChannel.vue'
import LastOnline from './LastOnline.vue'

const props = defineProps<{
  user: User
  detail?: UserDetail
}>()

const { lastOnlineAt, fetchOnlineUsers } = useOnlineUsers()
fetchOnlineUsers().catch(() => undefined)

const lastOnline = computed(() => {
  const confirmedAt = lastOnlineAt.value.get(props.user.id)
  const serverLastOnline = props.detail?.lastOnline

  if (!confirmedAt) return serverLastOnline ?? undefined
  if (!serverLastOnline) return confirmedAt

  return Date.parse(confirmedAt) > Date.parse(serverLastOnline)
    ? confirmedAt
    : serverLastOnline
})
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
