<template>
  <section>
    <profile-header text="ホームチャンネル" />
    <p :style="styles.text">
      <icon name="home" mdi :class="$style.icon" />
      <span
        v-if="channelId !== undefined"
        :class="$style.channel"
        @click="onClick"
      >
        #gps/times/{{ props.name }}
      </span>
      <span v-else>存在しません</span>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import useHomeChannelPath from '@/use/homeChannelPath'
import ProfileHeader from './ProfileHeader.vue'
import Icon from '@/components/UI/Icon.vue'
import { ChannelId } from '@/types/entity-ids'

const useStyles = (channelId: Ref<ChannelId | undefined>) =>
  reactive({
    text: makeStyles(theme => ({
      color:
        channelId.value !== undefined ? theme.ui.primary : theme.ui.tertiary
    }))
  })

interface Props {
  name: string
}

export default defineComponent({
  name: 'HomeChannel',
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

    const styles = useStyles(channelId)

    return {
      styles,
      props,
      channelId,
      onClick
    }
  },
  components: {
    ProfileHeader,
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
