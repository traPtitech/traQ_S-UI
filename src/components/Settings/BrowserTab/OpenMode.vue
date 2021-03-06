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

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { OpenMode } from '@/store/app/browserSettings'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormRadio from '@/components/UI/FormRadio.vue'
import useChannelPath from '@/use/channelPath'
import useChannelOptions from '@/use/channelOptions'
import store from '@/store'
import { useModelSyncer } from '@/use/modelSyncer'

export default defineComponent({
  name: 'OpenMode',
  components: {
    FormRadio,
    FormSelector
  },
  props: {
    openMode: {
      type: String as PropType<OpenMode>,
      required: true
    },
    openChannelName: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    // 起動時チャンネルの選択に必要
    store.dispatch.entities.fetchChannels()

    const { channelIdToPathString } = useChannelPath()

    const openModeValue = useModelSyncer(props, emit, 'openMode')
    const openChannelNameValue = useModelSyncer(props, emit, 'openChannelName')

    const { channelOptions } = useChannelOptions(undefined, channel =>
      channel ? channelIdToPathString(channel.id) : '(unknown)'
    )

    return {
      channelOptions,
      openModeValue,
      openChannelNameValue
    }
  }
})
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
