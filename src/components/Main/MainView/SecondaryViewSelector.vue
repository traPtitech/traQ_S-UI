<template>
  <null-view v-if="secondaryView" :class="$style.secondary" />
</template>

<script lang="ts" setup>
import NullView from './NullView/NullView.vue'
import { useMainViewStore } from '/@/store/ui/mainView'

const { secondaryView } = useMainViewStore()
</script>

<style lang="scss" module>
.secondary {
  height: 100%;
}
</style>
