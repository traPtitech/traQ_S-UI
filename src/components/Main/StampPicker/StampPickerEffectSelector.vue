<template>
  <div :class="$style.effectList">
    <stamp-picker-effect-selector-item
      v-for="effect in sizeEffectSet"
      :key="effect"
      :name="effect"
      :is-selected="sizeEffect === effect"
      @click="updateSizeEffect(effect)"
    />
    <stamp-picker-effect-selector-item
      v-for="effect in animeEffectsWithoutAlias"
      :key="effect"
      :name="effect"
      :is-selected="animeEffects.includes(effect)"
      :is-disabled="!animeEffects.includes(effect) && animeEffects.length >= 5"
      @click="updateAnimeEffect(effect)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { AnimeEffect, SizeEffect } from '@traptitech/traq-markdown-it'
import StampPickerEffectSelectorItem from './StampPickerEffectSelectorItem.vue'
import { animeEffectSet, sizeEffectSet } from '/@/lib/markdown/effects'

const sizeEffect = defineModel<SizeEffect | undefined>('sizeEffect', {
  required: true
})
const animeEffects = defineModel<AnimeEffect[]>('animeEffects', {
  required: true
})

const animeEffectsWithoutAlias = [...animeEffectSet].filter(
  e => e !== 'conga' && e !== 'conga-inv'
)

const updateSizeEffect = (e: SizeEffect) => {
  sizeEffect.value = sizeEffect.value === e ? undefined : e
}
const updateAnimeEffect = (e: AnimeEffect) => {
  if (!animeEffects.value.includes(e)) {
    animeEffects.value = [...animeEffects.value, e]
    return
  }
  animeEffects.value = animeEffects.value.filter(ae => ae !== e)
}
</script>

<style lang="scss" module>
.effectList {
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  gap: 4px 8px;
  overflow-y: auto;
}
</style>
