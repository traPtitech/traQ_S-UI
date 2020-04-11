<template>
  <div :style="styles.container">
    <channel-side-bar-content title="関連チャンネル">
      <template #header-control>
        <icon
          width="20"
          height="20"
          @click="toggle"
          name="rounded-triangle"
          :class="$style.icon"
          :style="styles.icon"
        />
      </template>
      <template #content>
        <channel-side-bar-relation-content
          v-if="state.isOpen"
          :parent="parent"
          :children="children"
          :siblings="siblings"
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
  watchEffect,
  ref,
  Ref,
  PropType
} from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import store from '@/store'
import { ChannelId } from '@/types/entity-ids'
import useChannelPath from '@/use/channelPath'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import ChannelSideBarRelationContent from './ChannelSideBarRelationContent.vue'
import api from '@/lib/api'

export type ChannelState = {
  id: ChannelId
  name: string
  topic: string
}

const useStyles = (state: { isOpen: boolean }) =>
  reactive({
    container: makeStyles(theme => ({
      background: theme.background.primary,
      color: theme.ui.secondary
    })),
    icon: makeStyles(theme => ({
      transform: state.isOpen ? 'rotate(180deg)' : '',
      transition: '0.5s'
    }))
  })

function getStates(channelIds: ChannelId[]): Promise<ChannelState[]> {
  return Promise.all(
    channelIds.map(async id => ({
      id: id,
      name: store.state.entities.channels[id]?.name,
      topic: (await api.getChannelTopic(id)).data.topic
    }))
  )
}

async function getState(channelId: ChannelId): Promise<ChannelState> {
  return {
    id: channelId,
    name: store.state.entities.channels[channelId]?.name,
    topic: (await api.getChannelTopic(channelId)).data.topic
  }
}

export default defineComponent({
  name: 'ChannelSideBarRelation',
  components: { Icon, ChannelSideBarRelationContent, ChannelSideBarContent },
  props: {
    channelId: { type: String as PropType<ChannelId>, required: true }
  },
  setup(props) {
    const state = reactive({
      isOpen: false
    })
    const styles = useStyles(state)
    let children: Ref<ChannelState[]> = ref([])
    let parent: Ref<ChannelState | undefined> = ref()
    let current: Ref<ChannelState | undefined> = ref()
    let siblings: Ref<ChannelState[]> = ref([])
    watchEffect(async () => {
      await Promise.all([
        (async () =>
          (children.value = await getStates(
            store.state.entities.channels[props.channelId].children
          )))(),
        (async () => (current.value = await getState(props.channelId)))(),
        (async () => {
          const parentId =
            store.state.entities.channels[props.channelId].parentId
          if (parentId) {
            await Promise.all([
              (async () => (parent.value = await getState(parentId)))(),
              (async () =>
                (siblings.value = (
                  await getStates(
                    store.state.entities.channels[parentId].children
                  )
                ).filter(v => v.id !== props.channelId)))()
            ])
          } else if (parentId === null) {
            await Promise.all([
              (() => (parent.value = undefined))(),
              (async () =>
                (siblings.value = (
                  await getStates(
                    store.state.domain.channelTree.channelTree.children.map(
                      v => v.id
                    )
                  )
                ).filter(el => el.id !== props.channelId)))()
            ])
          } else {
            await Promise.all([
              (() => (parent.value = undefined))(),
              (() => (siblings.value = []))()
            ])
          }
        })()
      ])
    })
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    return { styles, state, toggle, parent, current, children, siblings }
  }
})
</script>

<style lang="scss" module>
.icon {
  cursor: pointer;
  transform: rotate(0deg);
  transition: 0.5s;
}
</style>
