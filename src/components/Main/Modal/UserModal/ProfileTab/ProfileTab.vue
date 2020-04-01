<template>
  <div>
    <bio :bio="props.detail === undefined ? undefined : props.detail.bio" />
    <home-channel :name="props.user.name" />
    <accounts
      :bot="props.user.bot"
      :name="props.user.name"
      :twitterId="
        props.detail === undefined ? undefined : props.detail.twitterId
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
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

type Props = {
  user: User
  detail?: UserDetail
}

export default defineComponent({
  name: 'ProfileTab',
  props: {
    user: {
      type: Object,
      required: true
    },
    detail: Object
  },
  setup(props: Props) {
    const styles = useStyles()
    return { styles, props }
  },
  components: {
    Bio,
    HomeChannel,
    Accounts
  }
})
</script>
