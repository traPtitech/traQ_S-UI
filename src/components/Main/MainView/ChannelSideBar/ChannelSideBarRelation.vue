<template>
  <div :style="styles.container">
    <channel-side-bar-content title="関連チャンネル">
      <template #header-control>
        <icon width="20" height="20" @click="toggle" name="rounded-triangle" />
      </template>
      <template #content>
        <channel-side-bar-relation-content
          v-if="state.isOpen"
          :parent="state.parent"
          :children="state.children"
          :sisters="state.sisters"
          :current="state.current"
        />
      </template>
    </channel-side-bar-content>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  SetupContext
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import ChannelSideBarRelationContent from './ChannelSideBarRelationContent.vue'

type Props = {
  channelId: ChannelId
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    })),
    text: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

export default defineComponent({
  name: 'ChannelSideBarRelation',
  components: { Icon, ChannelSideBarRelationContent, ChannelSideBarContent },
  props: {
    channelId: { type: String, reqired: true }
  },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpen: false,
      children: computed(() => {
        const childrenIds =
          store.state.entities.channels[props.channelId].children
        return childrenIds
          .map(id => store.getters.entities.channelNameById(id))
          .filter(v => v)
      }),
      parent: computed(() => {
        const parentId = store.state.entities.channels[props.channelId].parentId
        if (parentId) {
          return store.getters.entities.channelNameById(parentId)
        } else {
          return null
        }
      }),
      sisters: computed(() => {
        const parentId = store.state.entities.channels[props.channelId].parentId
        if (parentId) {
          const childrenIds = store.state.entities.channels[parentId].children
          return childrenIds
            .map(id => store.getters.entities.channelNameById(id))
            .filter(v => v)
        } else {
          return []
        }
      }),
      current: computed(() => {
        return store.getters.entities.channelNameById(props.channelId) ?? null
      })
    })
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    return { styles, state, toggle }
  }
})
</script>

<style lang="scss" module>
$memberTitleSize: 1.15rem;

.text {
  font-weight: bold;
  font-size: $memberTitleSize;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 256px;
  border-radius: 4px;
  padding: 8px;
  flex-shrink: 0;
}

.icons {
  padding-bottom: 80px;
}
</style>
