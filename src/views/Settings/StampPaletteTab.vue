<template>
  <div :class="$style.container">
    <div :class="$style.text">
      <p>traQのスタンプをまとめたパレットを作成できます。</p>
      <p>スタンプパレットのアイコンはパレット先頭のスタンプが使用されます。</p>
    </div>
    <stamp-palette-list-tab />
  </div>
</template>

<script lang="ts" setup>
import StampPaletteListTab from '/@/components/Settings/StampPalette/StampPaletteListTab.vue'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { useStampsStore } from '/@/store/entities/stamps'

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
