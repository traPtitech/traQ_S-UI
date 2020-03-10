<template>
  <div
    :class="$style.container"
    :style="containerStyle"
    @click="$emit('channel-clicked', id)"
  >
    <span v-if="props.channel.skippedAncestorNames">
      #{{ path }}/{{ name }}
    </span>
    <span v-else> #{{ name }} </span>
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
import store from '../../../store'

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
    const containerStyle = computed(() => ({
      color: props.channel.active
        ? store.state.app.theme.ui.primary
        : store.state.app.theme.ui.secondary
    }))
    const path = computed(
      () => props.channel.skippedAncestorNames?.join('/') ?? ''
    )
    return {
      props,
      children,
      name,
      id,
      path,
      containerStyle
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
