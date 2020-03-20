<template>
  <div :class="$style.container">
    <navigation-content-title :current-navigation="props.currentNavigation" />
    <home v-show="props.currentNavigation === 'home'" :class="$style.content" />
    <channels
      v-show="props.currentNavigation === 'channels'"
      :class="$style.content"
    />
    <activity
      v-show="props.currentNavigation === 'activity'"
      :class="$style.content"
    />
    <users
      v-show="props.currentNavigation === 'users'"
      :class="$style.content"
    />
    <not-implemented
      v-show="props.currentNavigation === 'services'"
      :class="$style.content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import { NavigationItemType } from '@/components/Main/Navigation/use/navigation'
import Home from './NavigationContent/Home.vue'
import Channels from './NavigationContent/Channels.vue'
import Activity from './NavigationContent/Activity.vue'
import Users from './NavigationContent/Users.vue'
import NotImplemented from './NavigationContent/NotImplemented.vue'
import NavigationContentTitle from './NavigationContentTitle.vue'

type Props = {
  currentNavigation: NavigationItemType
}

export default defineComponent({
  name: 'NavigationContent',
  components: {
    Home,
    Channels,
    Activity,
    Users,
    NotImplemented,
    NavigationContentTitle
  },
  props: {
    currentNavigation: {
      type: String,
      default: 'home' as NavigationItemType
    }
  },
  setup(props: Props) {
    store.dispatch.entities.fetchChannels()
    store.dispatch.domain.fetchChannelActivity()
    const state = reactive({
      channels: computed(() => store.state.entities.channels)
    })
    const onClickChannel = (channelId?: ChannelId) => {
      store.commit.app.setCurrentChannelId(channelId ?? '')
      store.dispatch.entities.fetchMessagesByChannelId(channelId ?? '')
    }
    const topLevelChannels = computed(
      () => store.state.domain.channelTree.channelTree.children ?? []
    )

    return { state, props, onClickChannel, topLevelChannels }
  }
})
</script>

<style lang="scss" module>
.container {
  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: {
    top: 24px;
    left: 24px;
  }
}
.content {
  margin: 24px 0;
}
</style>
