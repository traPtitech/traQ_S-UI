import {
  arrayLimits,
  contractValues
} from '@traq-flavored-markdown/traq-plugin/nodes'
import type {
  StampAnimation,
  StampSize
} from '@traq-flavored-markdown/traq-plugin/nodes'

export type AnimeEffect = StampAnimation
export type SizeEffect = Exclude<StampSize, 'none'>
export const maxAnimeEffectCount = arrayLimits.StampEffects.animations.maxItems
export const animeEffectSet = new Set<AnimeEffect>(
  contractValues.StampAnimation
)
export const sizeEffectSet = new Set<SizeEffect>(
  contractValues.StampSize.filter((size): size is SizeEffect => size !== 'none')
)
