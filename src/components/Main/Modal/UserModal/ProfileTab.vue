<template>
  <div :class="$style.profile">
    <template v-if="detail === undefined">Now Loading...</template>
    <template v-else>
      <p>ひとこと: {{ detail.bio }}</p>
      <p>ほーむちゃんねる: #gps/times/{{ detail.name }}</p>
      <p>あかうんと @{{ detail.twitterId }}</p>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import { User, UserDetail } from '@traptitech/traq'
import apis from '../../../../lib/api'

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
  name: 'Profile',
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
      detail
    }
  }
})
</script>

<style lang="scss" module>
.profile {
}
</style>
