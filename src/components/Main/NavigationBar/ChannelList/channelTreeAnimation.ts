import type { VirtualItem } from '@tanstack/vue-virtual'

import type { FlatChannelItem } from './composables/useChannelFlatList'

export const CHANNEL_TREE_ANIMATION_DURATION_MS = 150

export interface VirtualChannelRow {
  vItem: VirtualItem
  item: FlatChannelItem
  key: string
}

export interface ChannelTreeAnimationRow {
  key: string
  item: FlatChannelItem
  start: number
  size: number
  index?: number
  isOpened: boolean
}

export interface ChannelTreeAnimationState {
  id: number
  direction: 'expand' | 'collapse'
  origin: number
  height: number
  trailingHeight: number
  rows: ChannelTreeAnimationRow[]
  movingRows: ChannelTreeAnimationRow[]
}

export interface ChannelTreeAnimationSnapshot extends ChannelTreeAnimationState {
  retainedRowIndexes: number[]
  retainedMovingRowIndexes: number[]
}

export interface ChannelTreeAnimationMeasurement {
  key: string
  size: number
}

interface CreateChannelTreeAnimationOptions {
  id: number
  direction: ChannelTreeAnimationState['direction']
  origin: number
  scrollMargin: number
  preRows: VirtualChannelRow[]
  postRows: VirtualChannelRow[]
  retainedKeys: Set<string>
  preExpandedNodeKeys: Set<string>
  expandedNodeKeys: Set<string>
  postTotalSize: number
  totalSizeDelta: number
  descendantKeyPrefix: string
}

const toAnimationRows = (
  rows: VirtualChannelRow[],
  expandedNodeKeys: Set<string>,
  origin: number,
  scrollMargin: number,
  hasCurrentIndex = true
): ChannelTreeAnimationRow[] =>
  rows.map(({ item, key, vItem }) => ({
    key,
    item,
    start: vItem.start - scrollMargin - origin,
    size: vItem.size,
    index: hasCurrentIndex ? vItem.index : undefined,
    isOpened: expandedNodeKeys.has(key)
  }))

export const createChannelTreeAnimation = ({
  id,
  direction,
  origin,
  scrollMargin,
  preRows,
  postRows,
  retainedKeys,
  preExpandedNodeKeys,
  expandedNodeKeys,
  postTotalSize,
  totalSizeDelta,
  descendantKeyPrefix
}: CreateChannelTreeAnimationOptions): ChannelTreeAnimationSnapshot => {
  const isExpanding = direction === 'expand'
  const sourceRows = isExpanding ? postRows : preRows
  const rows = toAnimationRows(
    sourceRows.filter(({ key }) => key.startsWith(descendantKeyPrefix)),
    isExpanding ? expandedNodeKeys : preExpandedNodeKeys,
    origin,
    scrollMargin,
    isExpanding
  )
  const height = Math.abs(totalSizeDelta)
  const finalTreeHeight = isExpanding ? height : 0
  const movingRows = toAnimationRows(
    postRows.filter(
      ({ key, vItem }) =>
        !key.startsWith(descendantKeyPrefix) &&
        vItem.start - scrollMargin >= origin + finalTreeHeight
    ),
    expandedNodeKeys,
    origin + finalTreeHeight,
    scrollMargin
  )

  return {
    id,
    direction,
    origin,
    height,
    trailingHeight: Math.max(postTotalSize - origin - finalTreeHeight, 0),
    rows,
    movingRows,
    retainedRowIndexes: rows.flatMap((row, index) =>
      retainedKeys.has(row.key) ? [index] : []
    ),
    retainedMovingRowIndexes: movingRows.flatMap((row, index) =>
      retainedKeys.has(row.key) ? [index] : []
    )
  }
}

const lowerBound = (
  rows: ChannelTreeAnimationRow[],
  offset: number,
  useEnd: boolean
) => {
  let left = 0
  let right = rows.length

  while (left < right) {
    const middle = Math.floor((left + right) / 2)
    const row = rows[middle]

    if (row && row.start + (useEnd ? row.size : 0) < offset) {
      left = middle + 1
    } else {
      right = middle
    }
  }

  return left
}

const selectRows = (
  rows: ChannelTreeAnimationRow[],
  retainedIndexes: number[],
  start: number,
  end: number,
  overscan: number
) => {
  const indexes = new Set(retainedIndexes)

  if (end > start) {
    const first = Math.max(lowerBound(rows, start, true) - overscan, 0)
    const last = Math.min(lowerBound(rows, end, false) + overscan, rows.length)
    for (let index = first; index < last; index++) indexes.add(index)
  }

  return [...indexes]
    .sort((a, b) => a - b)
    .flatMap(index => {
      const row = rows[index]
      return row ? [row] : []
    })
}

export const getVisibleChannelTreeAnimation = (
  animation: ChannelTreeAnimationSnapshot,
  viewportStart: number,
  viewportEnd: number,
  currentHeight: number,
  overscan: number
): ChannelTreeAnimationState => {
  const height = Math.max(0, currentHeight)
  const childStart = Math.max(viewportStart - animation.origin, 0)
  const childEnd = Math.min(viewportEnd - animation.origin, height)
  const movingOrigin = animation.origin + height

  return {
    ...animation,
    rows: selectRows(
      animation.rows,
      animation.retainedRowIndexes,
      childStart,
      childEnd,
      overscan
    ),
    movingRows: selectRows(
      animation.movingRows,
      animation.retainedMovingRowIndexes,
      Math.max(viewportStart - movingOrigin, 0),
      viewportEnd - movingOrigin,
      overscan
    )
  }
}

const resizeRows = (
  rows: ChannelTreeAnimationRow[],
  sizes: Map<string, number>
) => {
  let delta = 0

  const resizedRows = rows.map(row => {
    const size = sizes.get(row.key) ?? row.size
    const resizedRow = { ...row, start: row.start + delta, size }
    delta += size - row.size
    return resizedRow
  })

  return { rows: resizedRows, delta }
}

export const resizeChannelTreeAnimation = (
  animation: ChannelTreeAnimationSnapshot,
  measurements: ChannelTreeAnimationMeasurement[]
): ChannelTreeAnimationSnapshot => {
  const sizes = new Map(
    measurements
      .filter(({ size }) => size > 0)
      .map(({ key, size }) => [key, size])
  )

  const children = resizeRows(animation.rows, sizes)
  const trailing = resizeRows(animation.movingRows, sizes)

  return {
    ...animation,
    height: animation.height + children.delta,
    trailingHeight: animation.trailingHeight + trailing.delta,
    rows: children.rows,
    movingRows: trailing.rows
  }
}
