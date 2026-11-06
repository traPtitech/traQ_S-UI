import type {
  StampAnimation,
  StampSize
} from '@traq-flavored-markdown/traq-plugin/nodes'

export type AnimeEffect = StampAnimation
export type SizeEffect = Exclude<StampSize, 'none'>

export const animeEffectSet = new Set<AnimeEffect>([
  'rotate',
  'rotate-inv',
  'wiggle',
  'parrot',
  'zoom',
  'inversion',
  'turn',
  'turn-v',
  'happa',
  'pyon',
  'flashy',
  'pull',
  'atsumori',
  'stretch',
  'stretch-v',
  'conga',
  'conga-inv',
  'rainbow',
  'ascension',
  'shake',
  'party',
  'attract'
])
export const sizeEffectSet = new Set<SizeEffect>(['ex-large', 'large', 'small'])
