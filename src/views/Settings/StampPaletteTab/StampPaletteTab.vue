<template>
  <div :class="$style.container">
    <div :class="$style.text">
      <p>traQのスタンプをまとめたパレットを作成できます。</p>
      <p>スタンプパレットのアイコンはパレット先頭のスタンプが使用されます。</p>
    </div>
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

<style lang="scss" module>
.container {
  margin: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.text {
  margin-left: 12px;
}
</style>
