<template>
  <main-view-header>
    <template #header>
      <header-channel-name :channel-id="channelId" />
    </template>
    <template #tools>
      <header-tools :channel-id="channelId" />
    </template>
  </main-view-header>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api'
import { ChannelId } from '@/types/entity-ids'
import MainViewHeader from '@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import HeaderChannelName from './HeaderChannelName.vue'
import HeaderTools from './HeaderTools.vue'

export default defineComponent({
  name: 'ChannelViewHeader',
  components: {
    MainViewHeader,
    HeaderChannelName,
    HeaderTools
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup(props, context) {
    return {}
  }
})
</script>

<style lang="scss" module>
.container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 16px;
}
.headerContainer {
  display: flex;
}
.navigationButton {
  display: flex;
  align-items: center;
  margin-right: 8px;
}
</style>
