import { StampId } from '@/types/entity-ids'
import { StampSet } from '@/components/Main/StampPicker/use/stampSetSelector'
import { Place } from '.'

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
export type PositionOf = 'top-right' | 'bottom-right'

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const defaultSelectHandler = (_: SelectedStampData) => {}

export interface S {
  selectHandler: StampSelectHandler
  currentStampSet: StampSet
  position: Place | undefined
  positionOf: PositionOf
}

export const state: S = {
  selectHandler: defaultSelectHandler,
  currentStampSet: {
    type: 'history',
    id: ''
  },
  position: undefined,
  positionOf: 'top-right'
}
