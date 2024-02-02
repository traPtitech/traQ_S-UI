<template>
  <section>
    <h3 :class="$style.header">
      他端末/ブラウザで最新のメッセージを開いているチャンネル
    </h3>
    <ul v-if="monitoringChanelStrings.length > 0" :class="$style.list">
      <li v-for="channel in monitoringChanelStrings" :key="channel">
        {{ channel }}
      </li>
    </ul>
    <p v-else>他端末/ブラウザで開いているチャンネルはありません。</p>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import useChannelPath from '/@/composables/useChannelPath'
import { useChannelsStore } from '/@/store/entities/channels'
import { useViewStatesStore } from '/@/store/domain/viewStates'

const { monitoringChannels, fetchViewStates } = useViewStatesStore()
const { fetchChannels } = useChannelsStore()

fetchChannels()
fetchViewStates()

const { channelIdToPathString } = useChannelPath()

const monitoringChanelStrings = computed(() =>
  [...monitoringChannels.value.values()].map(cId => {
    try {
      return channelIdToPathString(cId, true)
    } catch {
      return ''
    }
  })
)
</script>

<style lang="scss" module>
.header {
  margin-bottom: 4px;
}

ul.list {
  list-style: disc;
  margin-left: 0;
  padding-left: 24px;
}
</style>
