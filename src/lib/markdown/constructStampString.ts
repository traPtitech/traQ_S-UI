import type {
  AnimeEffect,
  SizeEffect
} from '@traq-markdown-parser/trap-extension/stamp-effects'

export const constructStampString = (
  stampName: string,
  sizeEffect: SizeEffect | undefined,
  animeEffects: AnimeEffect[] | undefined
) => {
  const effects = []
  if (sizeEffect) {
    effects.push(sizeEffect)
  }
  if (animeEffects) {
    effects.push(...animeEffects)
  }

  const effectsString = effects.map(e => `.${e}`).join('')

  return `:${stampName}${effectsString}:`
}
