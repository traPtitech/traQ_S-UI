<template>
  <div :class="$style.profile">
    <profile-tab-bio
      :bio="props.detail === undefined ? undefined : props.detail.bio"
    />
    <profile-tab-home-channel :name="props.user.name" />
    <profile-tab-accounts
      :bot="props.user.bot"
      :name="props.user.name"
      :twitterId="
        props.detail === undefined ? undefined : props.detail.twitterId
      "
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import { User, UserDetail } from '@traptitech/traq'
import ProfileTabBio from '@/components/Main/Modal/UserModal/ProfileTabBio.vue'
import ProfileTabHomeChannel from '@/components/Main/Modal/UserModal/ProfileTabHomeChannel.vue'
import ProfileTabAccounts from '@/components/Main/Modal/UserModal/ProfileTabAccounts.vue'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

interface Props {
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
    return {
      styles,
      props
    }
  },
  components: {
    ProfileTabBio,
    ProfileTabHomeChannel,
    ProfileTabAccounts
  }
})
</script>

<style lang="scss" module>
.profile {
}
</style>
