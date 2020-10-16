<template>
  <div>
    <account-state :class="$style.section" :state="user.state" />
    <bio :class="$style.section" :bio="detail ? detail.bio : undefined" />
    <home-channel
      :class="$style.section"
      :id="detail ? detail.homeChannel : undefined"
    />
    <accounts
      :class="$style.section"
      :bot="user.bot"
      :name="user.name"
      :twitter-id="detail ? detail.twitterId : undefined"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { User, UserDetail } from '@traptitech/traq'
import AccountState from './AccountState.vue'
import Bio from './Bio.vue'
import HomeChannel from './HomeChannel.vue'
import Accounts from './Accounts.vue'

export default defineComponent({
  name: 'ProfileTab',
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    detail: Object as PropType<UserDetail>
  },
  setup() {
    return {}
  },
  components: {
    AccountState,
    Bio,
    HomeChannel,
    Accounts
  }
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
