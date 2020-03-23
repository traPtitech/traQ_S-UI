<template>
  <div :class="$style.modal">
    <feature :user="user" />
    <div>
      <icon name="user" :width="24" :height="24" />
      <icon name="user" :width="24" :height="24" />
      <icon name="user" :width="24" :height="24" />
    </div>
    <div>
      <profile-tab :user="user" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import Feature from './Feature.vue'
import Icon from '@/components/UI/Icon.vue'
import ProfileTab from './ProfileTab.vue'

const useStyles = () =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    }))
  })

interface Props {
  id: UserId
}

export default defineComponent({
  name: 'UserModal',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    const user = computed(() => store.state.entities.users[props.id])
    return {
      styles,
      user
    }
  },
  components: {
    Feature,
    Icon,
    ProfileTab
  }
})
</script>

<style lang="scss" module>
.modal {
}
</style>
