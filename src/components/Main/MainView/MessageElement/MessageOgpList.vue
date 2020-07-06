<template>
  <div :class="$style.container">
    <message-ogp-list-item
      v-for="(data, i) in ogpData"
      :class="$style.item"
      :key="i"
      :ogp-data="data"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import MessageOgpListItem from './MessageOgpListItem.vue'
import { Ogp } from '@traptitech/traq'
import store from '@/store'

const useOgpData = (props: { externalUrls: string[] }) => {
  const ogpData = props.externalUrls
    .map(url => store.state.entities.ogpData[url])
    .filter((o): o is Ogp => !!o)
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
      default: []
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
  &:not(:last-child) {
    margin-bottom: 1rem;
  }
}
</style>
