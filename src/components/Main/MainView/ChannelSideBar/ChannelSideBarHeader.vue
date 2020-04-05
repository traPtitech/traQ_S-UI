<template>
  <div :class="$style.container" :style="styles.container">
    <div v-for="child in state.children" :key="child.id">
      <span :class="$style.childHash" :style="styles.childHash">#</span>
      <router-link :to="buildChannelLink(child)" :style="styles.child">
        {{ child.name }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, Ref } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'
import { channelTree } from '../../../../store/domain/channelTree'
import { ChannelTreeNode } from '../../../../store/domain/channelTree/state'

type Props = {
  channelId: ChannelId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      color: theme.ui.primary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarHeader',
  props: { channelId: String },
  setup(props: Props) {
    const state = reactive({
      children: computed(() => {
        const { channelIdToChildrenSimpleChannel } = useChannelPath()
        return channelIdToChildrenSimpleChannel(props.channelId)
      })
    })
    const buildChannelLink = (channel: ChannelTreeNode) =>
      `${location.pathname}/${channel.name}`
    const styles = useStyles()
    return { props, state, styles, buildChannelLink }
  }
})
</script>

<style lang="scss" module>
$childChannelSize: 1.5rem;

.container {
  height: 100%;
}
.child {
  font-size: $childChannelSize;
  margin: 0 0.125rem;
}
.childHash {
  font-size: $childChannelSize;
  margin-right: 0.125rem;
  margin-left: 27px;
  user-select: none;
}
</style>
