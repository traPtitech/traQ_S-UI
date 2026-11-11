import type { VirtualItem } from '@tanstack/vue-virtual'

import { lowerBound } from '/@/lib/basic/array'

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

export interface VisibleChannelTreeAnimation {
  id: number
  direction: 'expand' | 'collapse'
  origin: number
  height: number
  trailingHeight: number
  rows: ChannelTreeAnimationRow[]
  movingRows: ChannelTreeAnimationRow[]
}

export interface ActiveChannelTreeAnimation extends VisibleChannelTreeAnimation {
  retainedRowIndexes: number[]
  retainedMovingRowIndexes: number[]
}

export interface ChannelTreeAnimationMeasurement {
  key: string
  size: number
}

interface CreateChannelTreeAnimationOptions {
  id: number
  direction: VisibleChannelTreeAnimation['direction']
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
}: CreateChannelTreeAnimationOptions): ActiveChannelTreeAnimation => {
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
        vItem.start - scrollMargin >= origin
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

const selectRows = (
  rows: ChannelTreeAnimationRow[],
  retainedIndexes: number[],
  start: number,
  end: number,
  overscan: number
) => {
  const indexes = new Set(retainedIndexes)

  if (end > start) {
    const first = Math.max(
      lowerBound(rows, row => row.start + row.size - start) - overscan,
      0
    )

    const last = Math.min(
      lowerBound(rows, row => row.start - end) + overscan,
      rows.length
    )

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
  activeAnimation: ActiveChannelTreeAnimation,
  viewportStart: number,
  viewportEnd: number,
  currentHeight: number,
  overscan: number
): VisibleChannelTreeAnimation => {
  const height = Math.max(0, currentHeight)
  const childStart = Math.max(viewportStart - activeAnimation.origin, 0)
  const childEnd = Math.min(viewportEnd - activeAnimation.origin, height)
  const movingOrigin = activeAnimation.origin + height

  return {
    ...activeAnimation,
    rows: selectRows(
      activeAnimation.rows,
      activeAnimation.retainedRowIndexes,
      childStart,
      childEnd,
      overscan
    ),
    movingRows: selectRows(
      activeAnimation.movingRows,
      activeAnimation.retainedMovingRowIndexes,
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
  activeAnimation: ActiveChannelTreeAnimation,
  measurements: ChannelTreeAnimationMeasurement[]
): ActiveChannelTreeAnimation => {
  const sizes = new Map(
    measurements
      .filter(({ size }) => size > 0)
      .map(({ key, size }) => [key, size])
  )

  const children = resizeRows(activeAnimation.rows, sizes)
  const trailing = resizeRows(activeAnimation.movingRows, sizes)

  return {
    ...activeAnimation,
    height: activeAnimation.height + children.delta,
    trailingHeight: activeAnimation.trailingHeight + trailing.delta,
    rows: children.rows,
    movingRows: trailing.rows
  }
}
