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
  isOpened: boolean
}

export interface ChannelTreeAnimationState {
  id: number
  direction: 'expand' | 'collapse'
  origin: number
  height: number
  trailingHeight: number
  rows: ChannelTreeAnimationRow[]
  rowKeys: Set<string>
  movingRows: ChannelTreeAnimationRow[]
  movingRowKeys: Set<string>
}

interface CreateChannelTreeAnimationOptions {
  id: number
  direction: ChannelTreeAnimationState['direction']
  origin: number
  scrollMargin: number
  preRows: VirtualChannelRow[]
  postRows: VirtualChannelRow[]
  prePositions: Map<string, number>
  preKeys: Set<string>
  preExpandedNodeKeys: Set<string>
  expandedNodeKeys: Set<string>
  postFlatItems: FlatChannelItem[]
  postTotalSize: number
  totalSizeDelta: number
  descendantKeyPrefix: string
}

const getMovingRowKeys = (
  postRows: VirtualChannelRow[],
  prePositions: Map<string, number>,
  preKeys: Set<string>,
  isCollapsing: boolean
) => {
  const keys = new Set<string>()
  for (const { key, vItem } of postRows) {
    const preStart = prePositions.get(key)
    if (
      (preStart !== undefined && preStart !== vItem.start) ||
      (isCollapsing && preStart === undefined && preKeys.has(key))
    ) {
      keys.add(key)
    }
  }
  return keys
}

const toAnimationRows = (
  rows: VirtualChannelRow[],
  expandedNodeKeys: Set<string>,
  origin: number,
  scrollMargin: number
): ChannelTreeAnimationRow[] =>
  rows.map(({ item, key, vItem }) => ({
    key,
    item,
    start: vItem.start - scrollMargin - origin,
    isOpened: expandedNodeKeys.has(key)
  }))

export const createChannelTreeAnimation = ({
  id,
  direction,
  origin,
  scrollMargin,
  preRows,
  postRows,
  prePositions,
  preKeys,
  preExpandedNodeKeys,
  expandedNodeKeys,
  postFlatItems,
  postTotalSize,
  totalSizeDelta,
  descendantKeyPrefix
}: CreateChannelTreeAnimationOptions): ChannelTreeAnimationState => {
  const isExpanding = direction === 'expand'
  const sourceRows = isExpanding ? postRows : preRows
  const rows = toAnimationRows(
    sourceRows.filter(({ key }) => key.startsWith(descendantKeyPrefix)),
    isExpanding ? expandedNodeKeys : preExpandedNodeKeys,
    origin,
    scrollMargin
  )
  const rowKeys = isExpanding
    ? new Set(
        postFlatItems
          .filter(({ key }) => key.startsWith(descendantKeyPrefix))
          .map(({ key }) => key)
      )
    : new Set(rows.map(row => row.key))

  const movingRowKeys = getMovingRowKeys(
    postRows,
    prePositions,
    preKeys,
    !isExpanding
  )
  const height = Math.abs(totalSizeDelta)
  const finalTreeHeight = isExpanding ? height : 0
  const movingRows = toAnimationRows(
    postRows.filter(({ key }) => movingRowKeys.has(key)),
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
    rowKeys,
    movingRows,
    movingRowKeys
  }
}
