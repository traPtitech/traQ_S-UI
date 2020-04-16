<template>
  <channel-side-bar-content title="関連チャンネル" @click="toggle">
    <template #header-control>
      <icon
        width="20"
        height="20"
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
</template>

<script lang="ts">
import { defineComponent, reactive, PropType } from '@vue/composition-api'
import { makeStyles } from '@/lib/styles'
import { ChannelId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'
import ChannelSideBarContent from './ChannelSideBarContent.vue'
import ChannelSideBarRelationContent from './ChannelSideBarRelationContent.vue'
import useRelatedChannels from './use/useRelatedChannels'

const useStyles = (state: { isOpen: boolean }) =>
  reactive({
    icon: makeStyles(theme => ({
      transform: state.isOpen ? 'rotate(180deg)' : '',
      transition: '0.5s'
    }))
  })

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
    const { current, parent, siblings, children } = useRelatedChannels(props)
    const toggle = () => {
      state.isOpen = !state.isOpen
    }
    return { styles, state, toggle, parent, current, children, siblings }
  }
})
</script>

<style lang="scss" module>
.icon {
  transform: rotate(0deg);
  transition: 0.5s;
}
</style>
