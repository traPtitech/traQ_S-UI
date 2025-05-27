import type { StampPalette } from '@traptitech/traq'
import router from '/@/router'
import { settingsStampPaletteRouteName } from '/@/router/settings'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

const { createStampPalette, editStampPalette } = useStampPalettesStore()

export const STAMP_PALETTE_NAME_MAX_LENGTH = 30
export const STAMP_PALETTE_DESCRIPTION_MAX_LENGTH = 1000
export const STAMP_PALETTE_STAMPS_LIMIT = 200

export const areStampPalettesEqual = (
  palette1: StampPalette,
  palette2: StampPalette
) => {
  if (palette1.name !== palette2.name) {
    return false
  }
  if (palette1.description !== palette2.description) {
    return false
  }
  const stamps1 = palette1.stamps
  const stamps2 = palette2.stamps
  if (stamps1.length !== stamps2.length) {
    return false
  }
  for (let i = 0; i < stamps1.length; i++) {
    if (stamps1[i] !== stamps2[i]) {
      return false
    }
  }
  return true
}

export const isStampPaletteNameValid = (stampPalette: StampPalette) => {
  return (
    stampPalette.name !== '' &&
    stampPalette.name.length <= STAMP_PALETTE_NAME_MAX_LENGTH
  )
}

export const isStampPaletteDescriptionValid = (stampPalette: StampPalette) => {
  return stampPalette.description.length <= STAMP_PALETTE_DESCRIPTION_MAX_LENGTH
}

export const isStampPaletteStampsValid = (stampPalette: StampPalette) => {
  return (
    0 < stampPalette.stamps.length &&
    stampPalette.stamps.length <= STAMP_PALETTE_STAMPS_LIMIT
  )
}

export const isStampPaletteValid = (stampPalette: StampPalette) => {
  return (
    isStampPaletteNameValid(stampPalette) &&
    isStampPaletteDescriptionValid(stampPalette) &&
    isStampPaletteStampsValid(stampPalette)
  )
}

export const editStampPaletteWrapper = async (stampPalette: StampPalette) => {
  await editStampPalette(stampPalette.id, {
    name: stampPalette.name,
    stamps: new Set(stampPalette.stamps),
    description: stampPalette.description
  })
}

export const createStampPaletteWrapper = async (stampPalette: StampPalette) => {
  return await createStampPalette({
    name: stampPalette.name,
    stamps: new Set(stampPalette.stamps),
    description: stampPalette.description
  })
}

export const goToSettingsStampPalette = () => {
  router.push({ name: settingsStampPaletteRouteName })
}
