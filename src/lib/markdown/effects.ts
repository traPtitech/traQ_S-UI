import type {
  AnimeEffect as AnimeEffectsOriginal,
  SizeEffect as SizeEffectsOriginal
} from '@traptitech/traq-markdown-it'

/**
 * @traptitech/traq-markdown-itは別chunkにしたいが、
 * そのままimportすると同じchunkに含まれてしまう
 *
 * この値しか使っていないのでここにコピーして使うことにする
 * なお、@traptitech/traq-markdown-itと値が一致しなくなった場合は、
 * 下のほうに記述してある型のチェックでエラーが出るようになっている
 */

const animeEffects = [
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
  'marquee',
  'marquee-inv',
  'rainbow',
  'ascension',
  'shake',
  'party',
  'attract'
] as const
const sizeEffects = ['ex-large', 'large', 'small'] as const

type AnimeEffectsCustom = (typeof animeEffects)[number]
type SizeEffectsCustom = (typeof sizeEffects)[number]

// []でくくっているのはDistributive Conditional Typesを避けたいため
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
type IsSame<T, S> = [T] extends [S] ? ([S] extends [T] ? true : false) : false

type AnimeEffects = IsSame<
  AnimeEffectsOriginal,
  AnimeEffectsCustom
> extends true
  ? AnimeEffectsCustom
  : never
type SizeEffects = IsSame<SizeEffectsOriginal, SizeEffectsCustom> extends true
  ? SizeEffectsCustom
  : never

// 一致しなかったらneverになって型エラーが出る
export const animeEffectSet = new Set<AnimeEffects>(animeEffects)
export const sizeEffectSet = new Set<SizeEffects>(sizeEffects)
