<template>
  <div :class="$style.container">
    <MessageOgpListItem
      v-for="(data, i) in ogpData"
      :key="i"
      :class="$style.item"
      :ogp-data="data"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { isDefined } from '/@/lib/basic/array'
import { useMessagesStore } from '/@/store/entities/messages'

import { useMessageReady } from '../composables/useMessageReady'
import MessageOgpListItem from './MessageOgpListItem.vue'

const props = withDefaults(
  defineProps<{
    externalUrls?: string[]
  }>(),
  {
    externalUrls: () => []
  }
)

const { ogpDataMap, fetchOgpData } = useMessagesStore()

const { register } = useMessageReady()
if (register) {
  register(Promise.all(props.externalUrls.map(url => fetchOgpData({ url }))))
}

const ogpData = computed(() =>
  props.externalUrls
    .map(url => ogpDataMap.value.get(url))
    .filter(isDefined)
    .filter(o => o.title)
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex-direction: column;
}
.item {
  // アイテムが消える可能性があるのでこちらにmarginをつける
  &:first-child {
    margin-top: 1rem;
  }
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}
</style>
