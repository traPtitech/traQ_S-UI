<template>
  <div :class="$style.profile">
    <profile-tab-bio :bio="detail === undefined ? undefined : detail.bio" />
    <profile-tab-home-channel :name="props.user.name" />
    <profile-tab-accounts
      :bot="props.user.bot"
      :name="props.user.name"
      :twitterId="detail === undefined ? undefined : detail.twitterId"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import { User, UserDetail } from '@traptitech/traq'
import ProfileTabBio from '@/components/Main/Modal/UserModal/ProfileTabBio.vue'
import ProfileTabHomeChannel from '@/components/Main/Modal/UserModal/ProfileTabHomeChannel.vue'
import ProfileTabAccounts from '@/components/Main/Modal/UserModal/ProfileTabAccounts.vue'
import apis from '@/lib/api'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

const useUserDetail = (id: UserId) => {
  const detail = ref<UserDetail>()
  apis.getUser(id).then(res => {
    detail.value = res.data
  })
  return detail
}

interface Props {
  user: User
}

export default defineComponent({
  name: 'ProfileTab',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const detail = useUserDetail(props.user.id)
    return {
      styles,
      props,
      detail
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
