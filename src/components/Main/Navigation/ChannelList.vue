<template>
  <div class="channel-list">
    <channel-element
      v-for="child in children"
      :key="child.channelId"
      :channel="child"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import useChannelTree from '@/use/channelTree'
import ChannelElement from '@/components/Main/Navigation/ChannelElement.vue'
import store from '@/store'

export default defineComponent({
  name: 'ChannelList',
  components: {
    ChannelElement
  },
  setup() {
    const { channelTree } = useChannelTree()
    const children = computed(() => channelTree.value.children ?? [])
    return {
      children
    }
  }
})
</script>
