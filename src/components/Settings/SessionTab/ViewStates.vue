<template>
  <div>
    <h3 :class="$style.header">閲覧中チャンネル一覧</h3>
    <div :class="$style.content">
      <template v-if="monitoringChanelStrings.length > 0">
        <p>他端末/ブラウザ/タブで開いているチャンネルは以下の通りです</p>
        <ul>
          <li v-for="channel in monitoringChanelStrings" :key="channel">
            {{ channel }}
          </li>
        </ul>
      </template>
      <p v-else>他端末/ブラウザ/タブで開いているチャンネルはありません</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import store from '/@/store'
import useChannelPath from '/@/use/channelPath'

export default defineComponent({
  name: 'ViewStates',
  setup() {
    store.dispatch.entities.fetchChannels()
    store.dispatch.domain.me.fetchViewStates()

    const { channelIdToPathString } = useChannelPath()

    const monitoringChannels = computed(
      () => store.getters.domain.me.monitoringChannels
    )
    const monitoringChanelStrings = computed(() =>
      [...monitoringChannels.value.values()].map(cId => {
        try {
          return channelIdToPathString(cId, true)
        } catch {
          return ''
        }
      })
    )

    return { monitoringChanelStrings }
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
</style>
