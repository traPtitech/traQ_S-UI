<template>
  <section :class="$style.feature" :style="styles.feature">
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
      <feature-link-button title="DM" iconName="email" iconMdi />
      <feature-link-button title="ホーム" iconName="email" iconMdi />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import { UserId } from '@/types/entity-ids'
import UserIcon from '@/components/UI/UserIcon.vue'
import FeatureLinkButton from '@/components/Main/Modal/UserModal/FeatureLinkButton.vue'
import { User } from '@traptitech/traq'

const useStyles = (iconSize: number) =>
  reactive({
    feature: makeStyles(theme => ({
      color: theme.ui.secondary,
      background: theme.background.secondary
    })),
    icon: makeStyles(theme => ({
      marginTop: `${-iconSize / 2}px`,
      borderColor: theme.background.secondary
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
    UserIcon,
    FeatureLinkButton
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
  border-top-left-radius: 16px; // overflow:hiddenを根本につけるとアイコンが表示されなくなる
  border-top-right-radius: 16px; // .modalのboder-radiusと同じ変数を参照させたい
}

.close {
  position: absolute;
  top: 0;
  right: 0;
}

.icon {
  margin: auto;
  border: 4px solid;
}

.onlineIndicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid;

  &[data-is-online] {
    background-color: #18fcfc;
    border-color: white;
  }
  &:not([data-is-online]) {
    background-color: red;
    border-color: lightgray;
  }
}
</style>
