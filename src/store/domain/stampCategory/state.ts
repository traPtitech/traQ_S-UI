import { StampCategory } from '/@/lib/stampCategorizer'

export interface S {
  traQStampCategory: Readonly<StampCategory>
  unicodeStampCategories: readonly StampCategory[]
}

export const state: S = {
  traQStampCategory: { name: 'traq', stampIds: [] },
  unicodeStampCategories: []
}
