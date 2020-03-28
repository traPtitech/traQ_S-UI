<template>
  <section :class="$style.feature">
    <user-icon
      :userId="user.id"
      :preventModal="true"
      :size="iconSize"
      :class="$style.icon"
      :style="styles.icon"
    />
    <div :class="$style.name">
      <h1>{{ props.user.displayName }}</h1>
      <p>
        <feature-online-indicator :userId="props.user.id" />
        @{{ props.user.name }}
      </p>
    </div>
    <div>
      <div @click="onDMClick" :style="{ display: 'inline-block' }">
        <feature-link-button iconName="email" iconMdi />
      </div>
      <div
        v-if="homeChannelId !== undefined"
        @click="onHomeChannelClick"
        :style="{ display: 'inline-block' }"
      >
        <feature-link-button title="ホーム" iconName="home" iconMdi />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, ref } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'
import { UserId, ChannelId } from '@/types/entity-ids'
import FeatureOnlineIndicator from './FeatureOnlineIndicator.vue'
import FeatureLinkButton from './FeatureLinkButton.vue'
import { User } from '@traptitech/traq'
import UserIcon from '@/components/UI/UserIcon.vue'

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
    const iconSize = 64

    const styles = useStyles()

    const onDMClick = () => {
      // TODO: DM対応
      //store.dispatch.domain.messagesView.changeCurrentChannel(/* DM Channel */)
    }

    const { homeChannelFromUsername } = useHomeChannelPath()

    let homeChannelId = ref<ChannelId>()
    try {
      homeChannelId.value = homeChannelFromUsername(
        props.user.name,
        store.state.domain.channelTree.channelTree
      )
    } catch (e) {}
    const onHomeChannelClick = () => {
      if (homeChannelId.value === undefined) return
      store.dispatch.domain.messagesView.changeCurrentChannel(
        homeChannelId.value
      )
    }

    return {
      props,
      iconSize,
      styles,
      homeChannelId,
      onDMClick,
      onHomeChannelClick
    }
  },
  components: {
    UserIcon,
    FeatureOnlineIndicator,
    FeatureLinkButton
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
