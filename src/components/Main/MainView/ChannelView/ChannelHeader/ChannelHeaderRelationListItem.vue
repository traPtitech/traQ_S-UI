<template>
  <router-link :id="linkId" :to="channelLink" :class="$style.wrap">
    <div :class="$style.channelName"># {{ props.channel.name }}</div>
    <div :class="[$style.topic, isTopicEmpty && $style.empty]">
      {{ topic }}
    </div>
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

const isTopicEmpty = computed(() => props.channel.topic.length === 0)
const topic = computed(() =>
  isTopicEmpty.value ? '[トピック未設定]' : props.channel.topic
)

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

  font-size: 0.75rem;

  &.empty {
    opacity: 0.5;
  }
}
</style>
