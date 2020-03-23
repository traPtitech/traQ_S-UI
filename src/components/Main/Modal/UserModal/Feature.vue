<template>
  <div :class="$style.feature">
    <button @click="onClickClear">X</button>
    <user-icon :userId="props.user.id" :preventModal="true" />
    <p>{{ props.user.displayName }}</p>
    <span :data-is-online="isOnline" />
    <p>@{{ props.user.name }}</p>
    <button>DM</button>
    <button>ホーム</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import UserIcon from '@/components/UI/UserIcon.vue'
import { User } from '@traptitech/traq'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

interface Props {
  user: User
}

export default defineComponent({
  name: 'Feature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.user.id)
    )
    const onClickClear = () => store.dispatch.ui.modal.clearModal()
    return {
      styles,
      props,
      isOnline,
      onClickClear
    }
  },
  components: {
    UserIcon
  }
})
</script>

<style lang="scss" module>
.feature {
}
</style>
