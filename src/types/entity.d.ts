import type { StampPalette as StampPalette_ } from '@traptitech/traq'
import type { StampId } from './entity-ids'

// FIXME: 型定義では `StampPalette['stamps']` は `Set<string>` だが，実際には `Array<string>` が返る
// openapi-generator のバグだが，どのように修正されるかわからないので一旦型の上書きによって対応する
// https://github.com/traPtitech/traQ_S-UI/issues/4612
export type StampPalette = Omit<StampPalette_, 'stamps'> & {
  stamps: StampId[]
}
