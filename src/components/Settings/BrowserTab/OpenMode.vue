<template>
  <div>
    <h3 :class="$style.header">起動時チャンネル設定</h3>
    <div :class="$style.content">
      <div :class="$style.channel">
        <form-radio
          v-model="openModeValue"
          label="最後に開いたチャンネル"
          input-value="lastOpen"
        />
      </div>
      <div :class="$style.channel">
        <form-radio
          v-model="openModeValue"
          label="特定のチャンネル"
          input-value="particular"
        />
        <form-selector
          v-if="openMode === 'particular'"
          v-model="openChannelNameValue"
          :options="channelOptions"
          :class="$style.selector"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormSelector from '/@/components/UI/FormSelector.vue'
import FormRadio from '/@/components/UI/FormRadio.vue'
import type { OpenMode } from '/@/store/app/browserSettings'
import useChannelPath from '/@/composables/useChannelPath'
import useChannelOptions from '/@/composables/useChannelOptions'
import { useModelSyncer } from '/@/composables/useModelSyncer'
import { useChannelsStore } from '/@/store/entities/channels'

const props = defineProps<{
  openMode: OpenMode
  openChannelName: string
}>()

const emit = defineEmits<{
  (e: 'update:openMode', _val: string): void
  (e: 'update:openChannelName', _val: string): void
}>()

const { fetchChannels } = useChannelsStore()
// 起動時チャンネルの選択に必要
fetchChannels()

const { channelIdToPathString } = useChannelPath()

const openModeValue = useModelSyncer(props, emit, 'openMode')
const openChannelNameValue = useModelSyncer(props, emit, 'openChannelName')

const { channelOptions } = useChannelOptions(undefined, channel =>
  channel ? channelIdToPathString(channel.id) : '(unknown)'
)
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.channel {
  margin-bottom: 12px;
}
.selector {
  margin: {
    top: 4px;
    left: 12px;
  }
}
</style>
