<template>
  <main-view-header>
    <template #header>
      <main-view-header-title :title="userName" icon-mdi icon-name="bookmark" />
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
import MainViewHeaderTitle from '@/components/Main/MainView/MainViewHeader/MainViewHeaderTitle.vue'
import HeaderTools from '@/components/Main/MainView/ChannelView/HeaderTools.vue'

export default defineComponent({
  name: 'DMViewHeader',
  components: {
    MainViewHeader,
    MainViewHeaderTitle,
    HeaderTools
  },
  props: {
    channelId: {
      type: String as PropType<ChannelId>,
      required: true
    },
    userName: {
      type: String,
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
