<template>
  <div :style="styles.container">
    <channel-side-bar-content title="関連チャンネル">
      <template #header-control>
        <icon width="20" height="20" @click="toggle" name="rounded-triangle" />
      </template>
      <template #content>
        <channel-side-bar-relation-content
          v-if="state.isOpen"
          :parent="parent"
          :children="children"
          :sisters="sisters"
          :current="current"
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
  SetupContext,
  onMounted,
  watchEffect,
  ref,
  Ref
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import ChannelSideBarRelationContent from './ChannelSideBarRelationContent.vue'
import api from '@/lib/api'

type Props = {
  channelId: ChannelId
}

export type ChannelState = {
  id?: ChannelId
  name?: string
  topic?: string
}

const useStyles = () =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    }))
  })

async function getStates(channelIds: ChannelId[]): Promise<ChannelState[]> {
  return await Promise.all(
    channelIds.map(async id => ({
      id: id,
      name: store.getters.entities.channelNameById(id),
      topic: (await api.getChannelTopic(id)).data.topic
    }))
  )
}

async function getState(channelId: ChannelId): Promise<ChannelState> {
  return await {
    id: channelId,
    name: store.getters.entities.channelNameById(channelId),
    topic: (await api.getChannelTopic(channelId)).data.topic
  }
}

export default defineComponent({
  name: 'ChannelSideBarRelation',
  components: { Icon, ChannelSideBarRelationContent, ChannelSideBarContent },
  props: {
    channelId: { type: String, reqired: true }
  },
  setup(props: Props) {
    const styles = useStyles()
    const state = reactive({
      isOpen: false
    })
    let children: Ref<ChannelState[]> = ref([])
    let parent: Ref<ChannelState> = ref({})
    let current: Ref<ChannelState> = ref({})
    let sisters: Ref<ChannelState[]> = ref([])
    watchEffect(async () => {
      children.value = await getStates(
        store.state.entities.channels[props.channelId].children
      )
      current.value = await getState(props.channelId)
      const parentId = store.state.entities.channels[props.channelId].parentId
      if (parentId) {
        parent.value = await getState(parentId)
        sisters.value = (
          await getStates(store.state.entities.channels[parentId].children)
        ).filter(v => v.id !== props.channelId)
      } else if (parentId === null) {
        sisters.value = (
          await getStates(
            store.state.domain.channelTree.channelTree.children.map(v => v.id)
          )
        ).filter(v => v.id !== props.channelId)
        parent.value = {}
      } else {
        sisters.value = []
        parent.value = {}
      }
    })
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    return { styles, state, toggle, parent, current, children, sisters }
  }
})
</script>
