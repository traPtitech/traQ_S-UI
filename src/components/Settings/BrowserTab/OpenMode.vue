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
        <filterable-channel-selector
          v-if="openMode === 'particular'"
          v-model="openChannelId"
          :options="channelOptions"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormRadio from '/@/components/UI/FormRadio.vue'
import type { OpenMode } from '/@/store/app/browserSettings'
import useChannelPath from '/@/composables/useChannelPath'
import useChannelOptions from '/@/composables/useChannelOptions'
import { useModelSyncer } from '/@/composables/useModelSyncer'
import { useChannelsStore } from '/@/store/entities/channels'
import FilterableChannelSelector from '/@/components/UI/FilterableChannelSelector.vue'
import { computed } from 'vue'
import { channelPathToId } from '/@/lib/channelTree'
import { useChannelTree } from '/@/store/domain/channelTree'

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
const { channelTree } = useChannelTree()

const openModeValue = useModelSyncer(props, emit, 'openMode')
const openChannelNameValue = useModelSyncer(props, emit, 'openChannelName')

const openChannelId = computed({
  get() {
    return channelPathToId(
      openChannelNameValue.value.split('/'),
      channelTree.value
    )
  },
  set(newValue: string) {
    openChannelNameValue.value = channelIdToPathString(newValue)
  }
})
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
