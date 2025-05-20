import type { StampPalette } from '@traptitech/traq'
import { useStampPalettesStore } from '/@/store/entities/stampPalettes'

const { createStampPalette, editStampPalette } = useStampPalettesStore()

export const STAMP_PALETTE_STAMPS_LIMIT = 200

export const isStampPaletteEdited = (
  stampPalette: StampPalette,
  originalStampPalette: StampPalette
) => {
  if (stampPalette.name !== originalStampPalette.name) {
    return true
  }
  if (stampPalette.description !== originalStampPalette.description) {
    return true
  }
  const stamps1 = stampPalette.stamps
  const stamps2 = originalStampPalette.stamps
  if (stamps1.length !== stamps2.length) {
    return true
  }
  for (let i = 0; i < stamps1.length; i++) {
    if (stamps1[i] !== stamps2[i]) {
      return true
    }
  }
  return false
}

export const isStampPaletteNameValid = (stampPalette: StampPalette) => {
  return stampPalette.name !== ''
}

export const isStampPaletteStampsValid = (stampPalette: StampPalette) => {
  return stampPalette.stamps.length <= STAMP_PALETTE_STAMPS_LIMIT
}

export const isStampPaletteValid = (stampPalette: StampPalette) => {
  return (
    isStampPaletteNameValid(stampPalette) &&
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
