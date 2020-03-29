import { StampCategory } from '@/lib/stampCategorizer'

export interface S {
  traQStampCategory: StampCategory
  unicodeStampCategories: StampCategory[]
}

export const state: S = {
  traQStampCategory: { name: 'traq', stampIds: [] },
  unicodeStampCategories: []
}
