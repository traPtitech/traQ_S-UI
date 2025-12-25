<template>
  <NullView v-if="secondaryView" :class="$style.secondary" />
</template>

<script lang="ts" setup>
import { useMainViewStore } from '/@/store/ui/mainView'

import NullView from './NullView/NullView.vue'

const { secondaryView } = useMainViewStore()
</script>

<style lang="scss" module>
.secondary {
  height: 100%;
}
</style>
