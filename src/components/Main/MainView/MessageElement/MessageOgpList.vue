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
import { defineComponent, PropType, computed } from 'vue'
import MessageOgpListItem from './MessageOgpListItem.vue'
import store from '/@/vuex'
import { isDefined } from '/@/lib/basic/array'

const useOgpData = (props: { externalUrls: string[] }) => {
  const ogpData = computed(() =>
    props.externalUrls
      .map(url => store.state.entities.messages.ogpDataMap.get(url))
      .filter(isDefined)
      .filter(o => o.title)
  )
  return { ogpData }
}

export default defineComponent({
  name: 'MessageOgpList',
  components: {
    MessageOgpListItem
  },
  props: {
    externalUrls: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  setup(props) {
    const { ogpData } = useOgpData(props)
    return { ogpData }
  }
})
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
