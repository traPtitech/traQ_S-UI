<template>
  <div :class="$style.container">
    <div :class="$style.title">traQ</div>
    <div>Client: v{{ clientVersion }}</div>
    <div>Server: {{ serverVersion ?? '-----' }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { VERSION } from '/@/lib/define'
import useVersion from '/@/use/version'

export default defineComponent({
  name: 'Version',
  setup() {
    const { version: serverVersionData } = useVersion()
    const serverVersion = computed(() => serverVersionData.value?.version)
    return {
      clientVersion: VERSION,
      serverVersion
    }
  }
})
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
