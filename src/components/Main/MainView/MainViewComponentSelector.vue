<template>
  <messages-view
    :class="$style.messagesView"
    v-if="props.viewInfo && props.viewInfo.type === 'messages'"
    :channel-id="channelId"
  />
  <qall-view v-else-if="props.viewInfo && props.viewInfo.type === 'qall'" />
  <div :class="$style.none" v-else></div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  computed,
  PropType
} from '@vue/composition-api'
import store from '@/store'
import { LayoutType, ViewInformation } from '@/store/ui/mainView/state'

import MessagesView from '@/components/Main/MainView/MessagesView.vue'
import QallView from '@/components/Main/MainView/QallView.vue'

export default defineComponent({
  name: 'MainViewComponentSelector',
  components: { MessagesView, QallView },
  props: {
    viewInfo: Object as PropType<ViewInformation>
  },
  setup(props) {
    const channelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )

    return {
      // TODO: https://github.com/vuejs/composition-api/issues/291
      props: props as { viewInfo: ViewInformation | undefined },
      channelId
    }
  }
})
</script>

<style lang="scss" module>
.none {
  display: none;
}
</style>
