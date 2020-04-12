<template>
  <modal-frame
    title="チャンネル作成"
    :subtitle="`#${channelPath}/`"
    icon-name="hash"
  >
  </modal-frame>
</template>

<script lang="ts">
import { defineComponent, computed, reactive } from '@vue/composition-api'
import store from '@/store'
import { makeStyles } from '@/lib/styles'
import useChannelPath from '@/use/channelPath'
import ModalFrame from '../Common/ModalFrame.vue'

export default defineComponent({
  name: 'ChannelCreateModal',
  components: {
    ModalFrame
  },
  props: {
    parentChannelId: String
  },
  setup() {
    const currentChannelId = computed(
      () => store.state.domain.messagesView.currentChannelId
    )
    const { channelIdToPath } = useChannelPath()
    const channelPath = computed(() =>
      channelIdToPath(currentChannelId.value).join('/')
    )
    return { currentChannelId, channelPath }
  }
})
</script>

<style lang="scss" module></style>
