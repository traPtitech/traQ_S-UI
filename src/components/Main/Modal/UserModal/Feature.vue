<template>
  <section :class="$style.feature">
    <button :class="$style.close" @click="onClickClear">X</button>
    <user-icon
      :userId="props.user.id"
      :preventModal="true"
      :size="iconSize"
      :class="$style.icon"
      :style="styles.icon"
    />
    <h1>{{ props.user.displayName }}</h1>
    <p>
      <span :class="$style.onlineIndicator" :data-is-online="isOnline" />
      @{{ props.user.name }}
    </p>
    <div>
      <button :class="$style.linkButton">DM</button>
      <button :class="$style.linkButton">ホーム</button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import UserIcon from '@/components/UI/UserIcon.vue'
import { User } from '@traptitech/traq'

const useStyles = (iconSize: number) =>
  reactive({
    modal: makeStyles(theme => ({
      color: theme.ui.primary,
      background: theme.background.primary
    })),
    icon: makeStyles(theme => ({
      marginTop: `${-iconSize / 2}px`
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
    const iconSize = 72
    const styles = useStyles(iconSize)

    const isOnline = computed(() =>
      store.getters.domain.isUserOnline(props.user.id)
    )
    const onClickClear = () => store.dispatch.ui.modal.clearModal()

    return {
      styles,
      iconSize,
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
  grid-column: 1/3;
  text-align: center;
}

.close {
  position: absolute;
  top: 0;
  right: 0;
}

.icon {
  margin: auto;
}

.onlineIndicator {
  &::before {
    content: '●';
  }
  &[data-is-online] {
    color: cyan;
  }
  &:not([data-is-online]) {
    color: red;
  }
}

.linkButton {
  border-radius: 1em;
}
</style>
