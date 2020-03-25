<template>
  <section>
    <profile-tab-header text="ホームチャンネル" />
    <p>
      <icon name="home" mdi :class="$style.icon" />
      <template v-if="channelId !== undefined">
        <span :class="$style.channel" @click="onClick"
          >#gps/times/{{ props.name }}</span
        >
      </template>
      <template v-else>
        <span>存在しません</span>
      </template>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'
import ProfileTabHeader from './ProfileTabHeader.vue'
import Icon from '@/components/UI/Icon.vue'
import { ChannelId } from '@/types/entity-ids'

interface Props {
  name: string
}

export default defineComponent({
  name: 'ProfileTabHomeChannel',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    const { homeChannelFromUsername } = useHomeChannelPath()

    let channelId = ref<ChannelId>()
    try {
      channelId.value = homeChannelFromUsername(
        props.name,
        store.state.domain.channelTree.channelTree
      )
    } catch (e) {}
    const onClick = () => {
      if (channelId.value === undefined) return
      store.dispatch.domain.messagesView.changeCurrentChannel(channelId.value)
    }

    return {
      props,
      channelId,
      onClick
    }
  },
  components: {
    ProfileTabHeader,
    Icon
  }
})
</script>

<style lang="scss" module>
.icon {
  display: inline-block;
  margin-right: 4px;
  vertical-align: bottom;
}

.channel {
  cursor: pointer;
}
</style>
