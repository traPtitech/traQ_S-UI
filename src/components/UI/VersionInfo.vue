<template>
  <div :class="$style.container" @click="onClick">
    <div :class="$style.title">traQ</div>
    <div>Client: v{{ clientVersion }}</div>
    <div>Server: {{ serverVersion ?? '-----' }}</div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { VERSION } from '/@/lib/define'
import useVersion from '/@/composables/useVersion'

const useManualUpdateCheck = () => {
  const threshold = 5
  const checkUpdate = async () => {
    const r = await navigator.serviceWorker.getRegistration()
    await r?.update()

    // eslint-disable-next-line no-console
    console.log('Ran update check')
  }

  const clickedCount = ref(0)
  const onClick = () => {
    clickedCount.value++
  }
  watchEffect(() => {
    if (clickedCount.value > threshold) {
      checkUpdate()
      clickedCount.value = 0
    }
  })

  return { onClick }
}
</script>

<script lang="ts" setup>
const { version: serverVersionData } = useVersion()
const serverVersion = computed(() => serverVersionData.value?.version)

const { onClick } = useManualUpdateCheck()

const clientVersion = VERSION
</script>

<style lang="scss" module>
.container {
  @include color-ui-tertiary;
  width: 100%;
  text-align: center;
}

.title {
  font-weight: bold;
}
</style>
