<template>
  <div>
    <h3 :class="$style.header">起動時チャンネル設定</h3>
    <div :class="$style.content">
      <div :class="$style.channel">
        <form-radio
          label="最後に開いたチャンネル"
          input-value="lastOpen"
          v-model="openModeValue"
        />
      </div>
      <div :class="$style.channel">
        <form-radio
          label="特定のチャンネル"
          input-value="particular"
          v-model="openModeValue"
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
import { computed, defineComponent, PropType } from 'vue'
import { OpenMode } from '@/store/app/browserSettings'
import FormSelector from '@/components/UI/FormSelector.vue'
import FormRadio from '@/components/UI/FormRadio.vue'
import useChannelPath from '@/use/channelPath'
import useChannelOptions from '@/use/channelOptions'
import store from '@/store'

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

    const openModeValue = computed({
      get() {
        return props.openMode
      },
      set(v) {
        emit('update:openMode', v)
      }
    })
    const openChannelNameValue = computed({
      get() {
        return props.openChannelName
      },
      set(v) {
        emit('update:openChannelName', v)
      }
    })

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
