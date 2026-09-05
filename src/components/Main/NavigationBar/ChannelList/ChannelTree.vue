<template>
  <div>
    <div :class="$style.inner" :style="getInnerStyle()">
      <div
        v-for="{ vItem, item, key } in displayedRows"
        :key="key"
        :ref="el => virtualizer.measureElement(el as Element | null)"
        :class="$style.row"
        :data-index="vItem.index"
        :data-key="key"
        :style="getRowStyle(vItem.start)"
      >
        <ChannelElement
          :class="$style.element"
          :channel="item.node"
          :depth="item.depth"
          :is-opened="expandedNodeKeys.has(item.key)"
          :show-topic="showTopic && (showChildTopic || item.depth === 0)"
          :show-shortened-path="showShortenedPath && item.depth === 0"
          :show-star="showStar"
          :show-notified="showNotified"
          @click-hash="() => handleToggle(item.key)"
        />
      </div>

      <div
        v-if="treeAnimation"
        :key="treeAnimation.id"
        :class="$style.animationFlow"
        :style="getAnimationFlowStyle(treeAnimation)"
      >
        <div
          :class="$style.treeAnimation"
          :data-direction="treeAnimation.direction"
          :style="getTreeAnimationStyle(treeAnimation)"
          @animationcancel.self="finishTreeAnimation(treeAnimation.id)"
          @animationend.self="finishTreeAnimation(treeAnimation.id)"
        >
          <div
            v-for="row in treeAnimation.rows"
            :key="row.key"
            :class="$style.animationRow"
            :data-key="row.key"
            :style="getTreeAnimationRowStyle(row.start, treeAnimation.origin)"
          >
            <ChannelElement
              :class="$style.element"
              :channel="row.item.node"
              :depth="row.item.depth"
              :is-opened="row.isOpened"
              :show-topic="
                showTopic && (showChildTopic || row.item.depth === 0)
              "
              :show-shortened-path="showShortenedPath && row.item.depth === 0"
              :show-star="showStar"
              :show-notified="showNotified"
            />
          </div>
        </div>

        <div
          :class="$style.movingRows"
          :style="getMovingRowsStyle(treeAnimation)"
        >
          <div
            v-for="row in treeAnimation.movingRows"
            :key="row.key"
            :class="$style.animationRow"
            :data-key="row.key"
            :style="getMovingRowStyle(row.start)"
          >
            <ChannelElement
              :class="$style.element"
              :channel="row.item.node"
              :depth="row.item.depth"
              :is-opened="row.isOpened"
              :show-topic="
                showTopic && (showChildTopic || row.item.depth === 0)
              "
              :show-shortened-path="showShortenedPath && row.item.depth === 0"
              :show-star="showStar"
              :show-notified="showNotified"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, toRef } from 'vue'

import { useVirtualizer } from '@tanstack/vue-virtual'

import type { ChannelTreeNode } from '/@/lib/channelTree'

import ChannelElement from './ChannelElement.vue'
import useChannelFlatList from './composables/useChannelFlatList'
import type { FlatChannelItem } from './composables/useChannelFlatList'

const CHANNEL_TREE_ANIMATION_DURATION_MS = 150
const TREE_ANIMATION_FALLBACK_MS = CHANNEL_TREE_ANIMATION_DURATION_MS + 50

/**
 * ChannelTreeコンポーネントのprops
 */
interface ChannelTreeProps {
  /** 表示するチャンネルの配列 */
  channels: ReadonlyArray<ChannelTreeNode>
  /** 仮想スクロールがスクロール位置を監視するコンテナ */
  scrollElement: HTMLElement | null
  /** スクロールコンテナの上端からこのコンポーネントの上端までの距離 */
  scrollMargin?: number
  /** 短縮されたパスを表示するかどうか */
  showShortenedPath?: boolean
  /** トピックを表示するかどうか */
  showTopic?: boolean
  /** 子チャンネルのトピックを表示するかどうか */
  showChildTopic?: boolean
  /** お気に入りチャンネルのアイコンを星にするかどうか */
  showStar?: boolean
  /** 通知設定済みチャンネルのアイコンを表示するかどうか */
  showNotified?: boolean
}

const props = withDefaults(defineProps<ChannelTreeProps>(), {
  scrollMargin: 0,
  showShortenedPath: false,
  showTopic: false,
  showChildTopic: true,
  showStar: false,
  showNotified: false
})

const { flatItems, expandedNodeKeys, toggle } = useChannelFlatList(
  toRef(props, 'channels')
)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: flatItems.value.length,
    getScrollElement: () => props.scrollElement,
    initialOffset: () => props.scrollElement?.scrollTop ?? 0,
    estimateSize: () => 36,
    useCachedMeasurements: !props.showTopic,
    overscan: 5,
    getItemKey: (index: number) => flatItems.value[index]?.key ?? index,
    scrollMargin: props.scrollMargin
  }))
)

// 仮想スクロールの合計サイズを外部に公開
defineExpose({
  totalSize: computed(() => virtualizer.value.getTotalSize())
})

const virtualItemRows = computed(() =>
  virtualizer.value.getVirtualItems().flatMap(vItem => {
    const item = flatItems.value[vItem.index]
    return item !== undefined ? [{ vItem, item, key: String(vItem.key) }] : []
  })
)

interface TreeAnimationRow {
  key: string
  item: FlatChannelItem
  start: number
  isOpened: boolean
}

interface TreeAnimation {
  id: number
  direction: 'expand' | 'collapse'
  origin: number
  height: number
  trailingHeight: number
  rows: TreeAnimationRow[]
  rowKeys: Set<string>
  movingRows: TreeAnimationRow[]
  movingRowKeys: Set<string>
}

const treeAnimation = ref<TreeAnimation | null>(null)
let treeAnimationId = 0
let resolveTreeAnimation: (() => void) | undefined

const displayedRows = computed(() => {
  const animation = treeAnimation.value
  if (!animation) return virtualItemRows.value

  return virtualItemRows.value.filter(
    ({ key }) =>
      !animation.rowKeys.has(key) && !animation.movingRowKeys.has(key)
  )
})

const getRowStyle = (start: number) => ({
  '--row-y': `${start - props.scrollMargin}px`
})

const getInnerStyle = () => {
  if (treeAnimation.value) return undefined

  return { height: `${virtualizer.value.getTotalSize()}px` }
}

const getAnimationFlowStyle = (animation: TreeAnimation) => ({
  paddingTop: `${animation.origin}px`
})

const getTreeAnimationStyle = (animation: TreeAnimation) => ({
  '--tree-animation-height': `${animation.height}px`,
  '--tree-animation-duration': `${CHANNEL_TREE_ANIMATION_DURATION_MS}ms`
})

const getTreeAnimationRowStyle = (start: number, origin: number) => ({
  '--animation-row-y': `${start - origin}px`
})

const getMovingRowsStyle = (animation: TreeAnimation) => ({
  height: `${animation.trailingHeight}px`
})

const getMovingRowStyle = (start: number) => ({
  '--animation-row-y': `${start}px`
})

const finishTreeAnimation = (animationId: number) => {
  if (treeAnimation.value?.id !== animationId) return

  treeAnimation.value = null
  resolveTreeAnimation?.()
  resolveTreeAnimation = undefined
}

/**
 * チャンネル展開を切り替える。
 *
 * PR 前の SlideDown と同様に、子ツリーを overflow: hidden のレイヤーへ置き、
 * その高さを CSS で伸縮する。後続行は同じ通常フローに置いて追従させる。
 */
const toggleWithAnimation = async (itemKey: string) => {
  // 展開前に仮想スクロールが描画している行の位置を記録する。
  const prePositions = new Map(
    virtualizer.value
      .getVirtualItems()
      .map(item => [String(item.key), item.start])
  )
  const preRows = virtualItemRows.value
  const preExpandedNodeKeys = new Set(expandedNodeKeys.value)
  const preKeys = new Set(flatItems.value.map(i => i.key))
  const preTotalSize = virtualizer.value.getTotalSize()
  const parent = virtualizer.value
    .getVirtualItems()
    .find(item => String(item.key) === itemKey)

  if (!parent) {
    toggle(itemKey)
    return
  }

  const direction = expandedNodeKeys.value.has(itemKey) ? 'collapse' : 'expand'
  const descendantKeyPrefix = `${itemKey}/`

  const collapsingRows =
    direction === 'collapse'
      ? preRows
          .filter(({ key }) => key.startsWith(descendantKeyPrefix))
          .map(({ item, key, vItem }) => ({
            key,
            item,
            start: vItem.start - props.scrollMargin,
            isOpened: preExpandedNodeKeys.has(key)
          }))
      : []

  toggle(itemKey)

  await nextTick()

  const postVirtualItems = virtualizer.value.getVirtualItems()
  const postTotalSize = virtualizer.value.getTotalSize()
  const totalSizeDelta = postTotalSize - preTotalSize

  if (totalSizeDelta === 0) {
    treeAnimation.value = null
    return
  }

  const movingRowKeys = new Set<string>()
  for (const item of postVirtualItems) {
    const key = String(item.key)
    const preStart = prePositions.get(key)

    if (preStart !== undefined && preStart !== item.start) {
      movingRowKeys.add(key)
    } else if (
      totalSizeDelta < 0 &&
      preStart === undefined &&
      preKeys.has(key)
    ) {
      // 折りたたみによって描画範囲へ戻った行は、折りたたみ前の位置から移動させる。
      movingRowKeys.add(key)
    }
  }

  const expandingRows =
    direction === 'expand'
      ? virtualItemRows.value
          .filter(({ key }) => key.startsWith(descendantKeyPrefix))
          .map(({ item, key, vItem }) => ({
            key,
            item,
            start: vItem.start - props.scrollMargin,
            isOpened: expandedNodeKeys.value.has(key)
          }))
      : []
  const rows = direction === 'expand' ? expandingRows : collapsingRows
  const rowKeys =
    direction === 'expand'
      ? new Set(
          flatItems.value
            .filter(({ key }) => key.startsWith(descendantKeyPrefix))
            .map(({ key }) => key)
        )
      : new Set(rows.map(row => row.key))

  const origin = parent.end - props.scrollMargin
  const height = Math.abs(totalSizeDelta)
  const finalTreeHeight = direction === 'expand' ? height : 0
  const movingRows = virtualItemRows.value
    .filter(({ key }) => movingRowKeys.has(key))
    .map(({ item, key, vItem }) => ({
      key,
      item,
      start: vItem.start - props.scrollMargin - origin - finalTreeHeight,
      isOpened: expandedNodeKeys.value.has(key)
    }))

  const id = ++treeAnimationId
  treeAnimation.value = {
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
  await new Promise<void>(resolve => {
    resolveTreeAnimation = resolve
    setTimeout(() => finishTreeAnimation(id), TREE_ANIMATION_FALLBACK_MS)
  })
}

// 同時に複数回操作された場合も、クリックされた順にすべて反映する。
let toggleQueue = Promise.resolve()
const handleToggle = (itemKey: string) => {
  toggleQueue = toggleQueue.then(() => toggleWithAnimation(itemKey))
}
</script>

<style lang="scss" module>
.inner {
  position: relative;
}
.row {
  position: absolute;
  top: 0;
  width: 100%;
  transform: translateY(var(--row-y));
}
.animationFlow {
  position: relative;
  width: 100%;
  pointer-events: none;
}
.treeAnimation {
  position: relative;
  width: 100%;
  overflow: hidden;

  &[data-direction='expand'] {
    animation: expand-tree var(--tree-animation-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
  &[data-direction='collapse'] {
    animation: collapse-tree var(--tree-animation-duration)
      cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }
}
.movingRows {
  position: relative;
  width: 100%;
}
.animationRow {
  position: absolute;
  top: 0;
  width: 100%;
  transform: translateY(var(--animation-row-y));
}
.element {
  margin: 0;
}

@keyframes expand-tree {
  from {
    height: 0;
  }
  to {
    height: var(--tree-animation-height);
  }
}

@keyframes collapse-tree {
  from {
    height: var(--tree-animation-height);
  }
  to {
    height: 0;
  }
}
</style>
