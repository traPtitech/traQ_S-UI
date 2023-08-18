<template>
  <router-link :id="linkId" :to="channelLink" :class="$style.wrap">
    <div :class="$style.channelName"># {{ props.channel.name }}</div>
    <div :class="$style.topic">{{ props.channel.topic }}</div>
  </router-link>
</template>

<script setup lang="ts">
import type { Channel } from '@traptitech/traq'
import { computed } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { RouterLink } from 'vue-router'
import { randomString } from '/@/lib/basic/randomString'

const props = defineProps<{
  channel: Channel
}>()

const linkId = randomString()
const focus = () => {
  // HACK: RouterLink が focus できないので、id から HTMLElement を取得して focus する
  const link = document.getElementById(linkId) as HTMLElement | null
  link?.focus()
}

const { channelIdToLink } = useChannelPath()
const channelLink = computed(() => channelIdToLink(props.channel.id))

defineExpose({ focus })
</script>

<style lang="scss" module>
.wrap {
  overflow: hidden;
  width: 100%;
  display: grid;
}

.channelName,
.topic {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  contain: strict;
  height: 1.5rem;
  line-height: 1.5rem;
}

.channelName {
  @include color-ui-primary;

  font-weight: bold;
}
.topic {
  @include color-ui-secondary;

  font-weight: bold;
  font-size: 0.75rem;
}
</style>
