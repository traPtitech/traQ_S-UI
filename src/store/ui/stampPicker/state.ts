import { StampId } from '@/types/entity-ids'

enum StampEffect {
  wiggle = 'wiggle',
  rotate = 'rotate'
}
enum StampSize {
  small = 'small',
  large = 'large',
  exLarge = 'ex-large'
}

export type SelectedStampData = {
  id: StampId
  effects?: StampEffect[]
  size?: StampSize
}
export type StampSelectHandler = (stamp: SelectedStampData) => void

export const defaultSelectHandler = (_: SelectedStampData) => {}

export interface S {
  targetPortalName: string

  selectHandler: StampSelectHandler
  currentStampPaletteId?: string
  currentStampCategoryName?: string
}

export const state: S = {
  targetPortalName: '',
  selectHandler: defaultSelectHandler,
  currentStampPaletteId: undefined,
  currentStampCategoryName: undefined
}
