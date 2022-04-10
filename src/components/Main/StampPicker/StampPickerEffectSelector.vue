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
import { sizeEffectSet, animeEffectSet } from '/@/lib/markdown/effects'
import StampPickerEffectSelectorItem from './StampPickerEffectSelectorItem.vue'

const props = defineProps<{
  sizeEffect: SizeEffect | undefined
  animeEffects: AnimeEffect[]
}>()

const emit = defineEmits<{
  (n: 'update:sizeEffect', sizeEffect: SizeEffect | undefined): void
  (n: 'update:animeEffects', animeEffects: AnimeEffect[]): void
}>()

const animeEffectsWithoutAlias = [...animeEffectSet].filter(
  e => e !== 'conga' && e !== 'conga-inv'
)

const updateSizeEffect = (e: SizeEffect) => {
  emit('update:sizeEffect', props.sizeEffect === e ? undefined : e)
}
const updateAnimeEffect = (e: AnimeEffect) => {
  if (!props.animeEffects.includes(e)) {
    emit('update:animeEffects', [...props.animeEffects, e])
    return
  }
  emit(
    'update:animeEffects',
    props.animeEffects.filter(ae => ae !== e)
  )
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
