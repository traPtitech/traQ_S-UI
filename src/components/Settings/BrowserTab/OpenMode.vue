<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>起動時チャンネル設定</h3>
      <p>
        特定のチャンネルを指定します。OFFの場合は最後に開いたチャンネルが設定されます。
      </p>
      <form-selector
        v-if="openMode === 'particular'"
        v-model="openChannelNameValue"
        :options="channelOptions"
      />
    </div>
    <div>
      <a-toggle
        :model-value="openModeValue === 'particular'"
        @update:model-value="toggleOpenMode"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import FormSelector from '/@/components/UI/FormSelector.vue'
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

const toggleOpenMode = () => {
  if (openModeValue.value === 'lastOpen') {
    openModeValue.value = 'particular'
  } else {
    openModeValue.value = 'lastOpen'
  }
}

const { channelOptions } = useChannelOptions(undefined, channel =>
  channel ? channelIdToPathString(channel.id) : '(unknown)'
)
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.description {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
