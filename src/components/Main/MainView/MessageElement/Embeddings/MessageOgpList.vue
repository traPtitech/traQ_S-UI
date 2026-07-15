<template>
  <div :class="$style.container">
    <MessageOgpListItem
      v-for="(item, index) in ogpItems"
      :key="`${item.url}-${index}`"
      :class="$style.item"
      :url="item.url"
      :ogp-data="item.ogpData"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { isDefined } from '/@/lib/basic/array'
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
  props.externalUrls
    .map((url: string) => {
      const ogpData = ogpDataMap.value.get(url)
      return isDefined(ogpData) ? { url, ogpData } : undefined
    })
    .filter(isDefined)
    .filter(({ ogpData }) => ogpData.title)
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
