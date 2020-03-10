<template>
  <div :class="$style.container" @click="$emit('channel-clicked', id)">
    #{{ name }}
    <div
      v-for="child in children"
      :key="child.channelId"
      :class="$style.children"
    >
      <channel-element :channel="child" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { ChannelTreeNode } from '@/store/domain/channelTree/state'

type Props = {
  channel: ChannelTreeNode
}

export default defineComponent({
  name: 'ChannelElement',
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  setup(props: Props) {
    const children = computed(() => props.channel.children ?? [])
    const name = computed(() => props.channel.name)
    const id = computed(() => props.channel.channelId)
    return {
      children,
      name,
      id
    }
  }
})
</script>

<style lang="scss" module>
.container {
  display: block;
}
.children {
  margin-left: 1rem;
  display: block;
}
</style>
