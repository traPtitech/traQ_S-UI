<template>
  <section :class="$style.feature">
    <user-icon
      :userId="user.id"
      :preventModal="true"
      :size="64"
      :class="$style.icon"
      :style="styles.icon"
    />
    <div :class="$style.name">
      <h1>{{ props.user.displayName }}</h1>
      <p>
        <online-indicator :userId="props.user.id" />
        @{{ props.user.name }}
      </p>
    </div>
    <buttons :username="props.user.name" />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'
import OnlineIndicator from './OnlineIndicator.vue'
import Buttons from './Buttons.vue'

const useStyles = () =>
  reactive({
    icon: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

interface Props {
  user: User
}

export default defineComponent({
  name: 'MobileFeature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const styles = useStyles()
    return { props, styles }
  },
  components: {
    UserIcon,
    OnlineIndicator,
    Buttons
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.icon {
  margin: 16px;
}

.name {
  margin: 16px 32px;
}
</style>
