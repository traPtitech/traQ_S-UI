import stampCategorized from '@/assets/unicode_emojis.json'
import { StampId } from '@/types/entity-ids'

type StampCategory = {
  category: string
  stamps: Record<string, StampId>
}

const categorizeStamps = () => {
  const numategories = stampCategorized.length + 1
  const stampCategories = new Array(numategories) as StampCategory[]

  stampCategories[0] = {
    category: 'traq',
    stamps: {}
  }
}

const defaultCategories = categorizeStamps()

const stampCategorizer = (stampData: any) => {
  const categorized = new Array(stampCategorized.length + 1)
  categorized[0] = {
    category: 'traq',
    stamps: {}
  }
  stampData.forEach((stamp: any) => {
    categorized[0].stamps[stamp.name] = stamp
  })
  stampCategorized.forEach((category: any) => {
    categorized[category.order] = {
      category: category.category,
      stamps: {}
    }
    category.emojis.forEach((stamp: any) => {
      const temp = categorized[0].stamps[stamp.name]
      if (temp) {
        categorized[category.order].stamps[stamp.name] = temp
        delete categorized[0].stamps[stamp.name]
      }
    })
  })
  categorized.forEach(category => {
    category.stamps = Object.values(category.stamps)
  })
  categorized[0].stamps.sort((lhs: any, rhs: any) => {
    if (lhs.name < rhs.name) {
      return -1
    } else if (lhs.name > rhs.name) {
      return 1
    } else {
      return 0
    }
  })
  return categorized
}

export default stampCategorizer
