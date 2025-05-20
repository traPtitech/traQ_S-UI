<template>
  <div>
    <stamp-palette-list v-if="isPathStampPalette" />
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StampPaletteList from '/@/components/Settings/StampPaletteTab/StampPaletteList.vue'
import { settingsStampPaletteRouteName } from '/@/router/settings'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'

const route = useRoute()
const isPathStampPalette = computed(
  () => route.name === settingsStampPaletteRouteName
)

const { fetchStamps } = useStampsStore()
fetchStamps()
const { fetchStampPalettes } = useStampPalettesStore()
fetchStampPalettes()
</script>

<style lang="scss" module></style>
