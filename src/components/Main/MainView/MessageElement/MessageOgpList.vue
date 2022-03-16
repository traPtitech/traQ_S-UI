<template>
  <div :class="$style.container">
    <message-ogp-list-item
      v-for="(data, i) in ogpData"
      :key="i"
      :class="$style.item"
      :ogp-data="data"
    />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';
import { isDefined } from '/@/lib/basic/array'
import { useMessagesStore } from '/@/store/entities/messages'

const useOgpData = (props: { externalUrls: string[] }) => {
  const { ogpDataMap } = useMessagesStore()

  const ogpData = computed(() =>
    props.externalUrls
      .map(url => ogpDataMap.value.get(url))
      .filter(isDefined)
      .filter(o => o.title)
  )
  return { ogpData }
}
</script>

<script lang="ts" setup>
import MessageOgpListItem from './MessageOgpListItem.vue';

const props = withDefaults(defineProps<{
    externalUrls?: string[]
}>(), {
    externalUrls: () => []
});

const { ogpData } = useOgpData(props)
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
