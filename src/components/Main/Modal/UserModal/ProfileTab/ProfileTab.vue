<template>
  <div>
    <bio :bio="props.detail ? props.detail.bio : undefined" />
    <home-channel :id="props.detail ? props.detail.homeChannel : undefined" />
    <accounts
      :bot="user.bot"
      :name="user.name"
      :twitter-id="props.detail ? props.detail.twitterId : undefined"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
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
  setup(props) {
    return {
      // TODO: https://github.com/vuejs/composition-api/issues/291
      props: props as { detail?: UserDetail }
    }
  },
  components: {
    Bio,
    HomeChannel,
    Accounts
  }
})
</script>
