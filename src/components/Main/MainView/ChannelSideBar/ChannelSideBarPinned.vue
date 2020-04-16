<template>
  <channel-side-bar-content title="ピン留め" @click="onClick">
    <template #header-control>{{ propst.pinnedMessageLength }}</template>
  </channel-side-bar-content>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import ChannelSideBarContent from './ChannelSideBarContent.vue'

export default defineComponent({
  name: 'ChannelSideBarPinned',
  props: { pinnedMessageLength: { type: Number, default: 0 } },
  components: { ChannelSideBarContent },
  setup(props, context) {
    const onClick = () => context.emit('open')
    // TODO: https://github.com/vuejs/composition-api/issues/291
    const propst = props as { pinnedMessageLength: number }
    return {
      propst,
      onClick
    }
  }
})
</script>
