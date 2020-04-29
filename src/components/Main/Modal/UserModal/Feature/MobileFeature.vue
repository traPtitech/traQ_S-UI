<template>
  <section :class="$style.feature">
    <user-icon
      :user-id="user.id"
      :prevent-modal="true"
      :size="64"
      :class="$style.icon"
      :style="styles.icon"
    />
    <div :class="$style.name">
      <h1>{{ user.displayName }}</h1>
      <p>
        <online-indicator :user-id="user.id" />
        @{{ user.name }}
      </p>
    </div>
    <buttons
      :home-channel-id="props.detail ? props.detail.homeChannel : undefined"
      :user-name="user.name"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { User, UserDetail } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'
import OnlineIndicator from './OnlineIndicator.vue'
import Buttons from './Buttons.vue'

const useStyles = () =>
  reactive({
    icon: makeStyles(theme => ({
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'MobileFeature',
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
