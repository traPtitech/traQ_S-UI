<template>
  <div>
    <bio :bio="detail ? detail.bio : undefined" />
    <home-channel :id="detail ? detail.homeChannel : undefined" />
    <accounts
      :bot="user.bot"
      :name="user.name"
      :twitter-id="detail ? detail.twitterId : undefined"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { User, UserDetail } from '@traptitech/traq'
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
    Bio,
    HomeChannel,
    Accounts
  }
})
</script>
