<template>
  <div>
    <account-state :class="$style.section" :state="user.state" />
    <bio :class="$style.section" :bio="detail?.bio" />
    <home-channel :id="detail?.homeChannel" :class="$style.section" />
    <accounts
      :class="$style.section"
      :bot="user.bot"
      :name="user.name"
      :twitter-id="detail?.twitterId"
    />
    <last-online :class="$style.section" :last-online="detail?.lastOnline" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { User, UserDetail } from '@traptitech/traq'
import AccountState from './AccountState.vue'
import Bio from './Bio.vue'
import HomeChannel from './HomeChannel.vue'
import Accounts from './Accounts.vue'
import LastOnline from './LastOnline.vue'

export default defineComponent({
  name: 'ProfileTab',
  components: {
    AccountState,
    Bio,
    HomeChannel,
    Accounts,
    LastOnline
  },
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    detail: {
      type: Object as PropType<UserDetail>,
      default: undefined
    }
  },
  setup() {
    return {}
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
