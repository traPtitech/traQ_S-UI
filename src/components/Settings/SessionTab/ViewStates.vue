<template>
  <section>
    <h3 :class="$style.header">
      他端末/ブラウザで最新のメッセージを開いているチャンネル
    </h3>
    <ul v-if="monitoringChannelStrings.length > 0" :class="$style.list">
      <li v-for="channel in monitoringChannelStrings" :key="channel">
        {{ channel }}
      </li>
    </ul>
    <p v-else>他端末/ブラウザで開いているチャンネルはありません。</p>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import useChannelPath from '/@/composables/useChannelPath'
import useEnsureThread from '/@/composables/useEnsureThread'
import { fallbackChannelPath } from '/@/lib/config'
import { useViewStatesStore } from '/@/store/domain/viewStates'
import { useChannelsStore } from '/@/store/entities/channels'

const { monitoringChannels, fetchViewStates } = useViewStatesStore()
const { fetchChannels } = useChannelsStore()

fetchChannels()
fetchViewStates()

const { channelIdToPathString } = useChannelPath()

useEnsureThread(() => [...monitoringChannels.value.values()])

const monitoringChannelStrings = computed(() =>
  [...monitoringChannels.value.values()].map(
    channelId => channelIdToPathString(channelId, true) ?? fallbackChannelPath
  )
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
