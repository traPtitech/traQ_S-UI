<template>
  <div :class="$style.container">
    <div :class="$style.title">traQ</div>
    <div>Client: v{{ clientVersion }}</div>
    <div>Server: {{ severVersion.version }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import version from '@/lib/env/version'
import store from '@/store'

export default defineComponent({
  name: 'Version',
  setup() {
    const severVersion = computed(() => store.state.app.version)
    return { clientVersion: version, severVersion }
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
