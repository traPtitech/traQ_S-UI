<script lang="ts" setup>
import { computed } from 'vue'
import VideoComponent from '/@/components/Main/MainView/QallView/VideoComponent.vue'
import { useQall } from '/@/composables/qall/useQall'
import { useRouter } from 'vue-router'
import { constructChannelPath } from '/@/router'
import useChannelPath from '/@/composables/useChannelPath'

const { tracksMap, callingChannel, isSubView } = useQall()
const router = useRouter()
const { channelIdToPathString } = useChannelPath()

const firstVideoTrack = computed(
  () =>
    tracksMap.value &&
    Array.from(tracksMap.value.entries()).find(
      ([_sid, track]) => track.trackPublication?.kind === 'video'
    )
)

const restoreMainView = () => {
  console.log(callingChannel.value)
  const channelPath = channelIdToPathString(callingChannel.value)
  router.push(constructChannelPath(channelPath))
  isSubView.value = false
}
</script>
<template>
  <div :class="$style.container" @click="restoreMainView">
    <VideoComponent
      v-if="firstVideoTrack"
      :key="firstVideoTrack[0]"
      :track-info="firstVideoTrack[1]"
    />
    <div v-else>Qallにもどる</div>
  </div>
</template>

<style lang="scss" module>
.container {
  cursor: pointer;
  margin: 0.5rem;
  margin-bottom: 1rem;
}
</style>
