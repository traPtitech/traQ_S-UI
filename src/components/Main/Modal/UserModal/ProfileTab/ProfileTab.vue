<template>
  <div>
    <bio :bio="props.detail === undefined ? undefined : props.detail.bio" />
    <home-channel :name="user.name" />
    <accounts
      :bot="user.bot"
      :name="user.name"
      :twitter-id="
        props.detail === undefined ? undefined : props.detail.twitterId
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User, UserDetail } from '@traptitech/traq'
import Bio from './Bio.vue'
import HomeChannel from './HomeChannel.vue'
import Accounts from './Accounts.vue'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

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
    const styles = useStyles()
    return {
      styles,
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
