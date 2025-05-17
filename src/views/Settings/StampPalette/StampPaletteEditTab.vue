<template>
  <section>
    <h3>スタンプパレットの編集</h3>
    <div v-if="!stampPalette">
      <!-- TODO: デザインを整える -->
      <div>
        <p>スタンプパレットは存在しません。</p>
        <p>
          スタンプパレットは削除されたか、URLが間違っている可能性があります。
        </p>
      </div>
      <!-- TODO: 戻るボタンの実装 -->
    </div>
    <stamp-palette-editor v-else v-model="stampPalette" />
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import StampPaletteEditor from '/@/components/Settings/StampPalette/StampPaletteEditor.vue'
// import { useStampPalettesStore } from '/@/store/entities/stampPalettes'
import { mockStampPalettesMap } from '/@/components/Settings/StampPalette/stampPaletteMock'

const { paletteId: paletteId } = defineProps<{
  paletteId: string
}>()

// FIXME: 開発中はモックデータを使用
// const { stampPalettesMap } = useStampPalettesStore()
const stampPalette = computed(() => mockStampPalettesMap.value.get(paletteId))
</script>

<style lang="scss" module></style>
