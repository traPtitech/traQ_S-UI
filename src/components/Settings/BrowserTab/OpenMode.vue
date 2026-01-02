<template>
  <div :class="$style.container">
    <div :class="$style.description">
      <h3>起動時チャンネル設定</h3>
      <p>
        特定のチャンネルを指定します。OFFの場合は最後に開いたチャンネルが設定されます。
      </p>
      <FormSelectorFilterable
        v-if="openMode === 'particular'"
        v-model="openChannelIdValue"
        :options="channelOptions"
      />
    </div>
    <div>
      <AToggle
        :model-value="openModeValue === 'particular'"
        @update:model-value="toggleOpenMode"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AToggle from '/@/components/UI/AToggle.vue'
import FormSelectorFilterable from '/@/components/UI/FormSelectorFilterable.vue'
import useChannelOptions from '/@/composables/useChannelOptions'
import type { OpenMode } from '/@/store/app/browserSettings'
import { useChannelsStore } from '/@/store/entities/channels'
import type { ChannelId } from '/@/types/entity-ids'

const { fetchChannels } = useChannelsStore()
// 起動時チャンネルの選択に必要
fetchChannels()

const openModeValue = defineModel<OpenMode>('openMode', { required: true })
const openChannelIdValue = defineModel<ChannelId | null>('startupChannelId', {
  required: true
})

const toggleOpenMode = () => {
  if (openModeValue.value === 'lastOpen') {
    openModeValue.value = 'particular'
  } else {
    openModeValue.value = 'lastOpen'
  }
}

const { channelOptions } = useChannelOptions(undefined)
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
