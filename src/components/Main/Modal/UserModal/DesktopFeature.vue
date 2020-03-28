<template>
  <section :class="$style.feature">
    <div>
      <h1>{{ props.user.displayName }}</h1>
      <p>
        <feature-online-indicator :userId="props.user.id" />
        @{{ props.user.name }}
      </p>
    </div>
    <div>
      <div @click="onDMClick" :style="{ display: 'inline-block' }">
        <feature-link-button title="DM" iconName="email" iconMdi />
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
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'
import { UserId, ChannelId } from '@/types/entity-ids'
import FeatureOnlineIndicator from './FeatureOnlineIndicator.vue'
import FeatureLinkButton from './FeatureLinkButton.vue'
import { User } from '@traptitech/traq'

interface Props {
  user: User
}

export default defineComponent({
  name: 'DesktopFeature',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
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
      homeChannelId,
      onDMClick,
      onHomeChannelClick
    }
  },
  components: {
    FeatureOnlineIndicator,
    FeatureLinkButton
  }
})
</script>

<style lang="scss" module>
.feature {
  grid-column: 1/3;
  text-align: center;
}
</style>
