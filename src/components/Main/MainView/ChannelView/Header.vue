<template>
  <main-view-header>
    <template #header>
      <div :class="$style.header">
        <header-channel-name :channel-id="channelId" />
        <header-topic :class="$style.topic" :channel-id="channelId" />
      </div>
    </template>
    <template #tools>
      <header-tools :channel-id="channelId" />
    </template>
  </main-view-header>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ChannelId } from '/@/types/entity-ids'
import MainViewHeader from '/@/components/Main/MainView/MainViewHeader/MainViewHeader.vue'
import HeaderChannelName from './HeaderChannelName.vue'
import HeaderTopic from './HeaderTopic.vue'
import HeaderTools from './HeaderTools.vue'

export default defineComponent({
  name: 'ChannelViewHeader',
  components: {
    MainViewHeader,
    HeaderTopic,
    HeaderChannelName,
    HeaderTools
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    }
  },
  setup() {
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
.header {
  display: flex;
  align-items: center;
  overflow-x: auto;
}
.topic {
  margin-left: 16px;
  [data-is-mobile] & {
    margin-left: 12px;
  }
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
