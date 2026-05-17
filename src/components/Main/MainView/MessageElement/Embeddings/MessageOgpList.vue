<template>
  <div :class="$style.container">
    <MessageOgpListItem
      v-for="item in ogpItems"
      :key="item.url"
      :class="$style.item"
      :url="item.url"
      :ogp-data="item.ogpData"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useMessagesStore } from '/@/store/entities/messages'

import MessageOgpListItem from './MessageOgpListItem.vue'

const props = withDefaults(
  defineProps<{
    externalUrls?: string[]
  }>(),
  {
    externalUrls: () => []
  }
)

const { ogpDataMap } = useMessagesStore()

const ogpItems = computed(() =>
  props.externalUrls.flatMap(url => {
    const ogpData = ogpDataMap.value.get(url)
    if (!ogpData?.title) {
      return []
    }
    return [{ url, ogpData }]
  })
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
