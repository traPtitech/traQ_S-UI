<template>
  <div :class="$style.container">
    <video ref="$remoteVideoRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from '@vue/composition-api'
import store from '@/store'

export default defineComponent({
  name: 'QallView',
  props: {},
  setup() {
    const $remoteVideoRef = ref<HTMLVideoElement>(null)
    watchEffect(() => {
      if ($remoteVideoRef.value) {
        $remoteVideoRef.value.srcObject =
          Object.values(store.state.app.rtc.remoteVideoStreamMap)[0] ?? null
      }
    })
    return { $remoteVideoRef }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-common-black;
  @include color-ui-primary;
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
}
</style>
