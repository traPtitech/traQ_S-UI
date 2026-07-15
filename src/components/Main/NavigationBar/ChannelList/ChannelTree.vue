<template>
  <div ref="wrapperRef">
    <div
      :class="$style.inner"
      :style="{ height: `${virtualizer.getTotalSize()}px` }"
    >
      <div
        v-for="{ vItem, item, key } in virtualItemRows"
        :key="key"
        :ref="el => el && virtualizer.measureElement(el as Element)"
        :data-index="vItem.index"
        :data-key="key"
        :style="{
          position: 'absolute',
          top: `${vItem.start - props.scrollMargin}px`,
          width: '100%'
        }"
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, toRef } from 'vue'

import { useVirtualizer } from '@tanstack/vue-virtual'

import { rAF } from '/@/lib/basic/timer'
import type { ChannelTreeNode } from '/@/lib/channelTree'

import ChannelElement from './ChannelElement.vue'
import useChannelFlatList from './composables/useChannelFlatList'

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

const wrapperRef = ref<HTMLElement | null>(null)
const { flatItems, expandedNodeKeys, toggle } = useChannelFlatList(
  toRef(props, 'channels')
)

const virtualizer = useVirtualizer(
  computed(() => ({
    count: flatItems.value.length,
    getScrollElement: () => props.scrollElement,
    estimateSize: () => 36,
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

/** チャンネル展開を切り替えたときのアニメーション */
const handleToggle = async (itemKey: string) => {
  // 展開前に仮想スクロールが描画している要素の位置を記録
  // 描画範囲外の物は含まない
  const prePositions = new Map(
    virtualizer.value
      .getVirtualItems()
      .map(item => [String(item.key), item.start])
  )

  // flatItemsに含まれるすべてのチャンネルのキー
  // 仮想スクロールで描画されているかに関わらずすべてを含む
  const preKeys = new Set(flatItems.value.map(i => i.key))

  // 仮想スクロールの合計サイズ
  const preTotalSize = virtualizer.value.getTotalSize()

  toggle(itemKey)
  await nextTick()
  await rAF()

  if (!wrapperRef.value) return

  // チャンネル展開後に新たに表示される要素
  const newElements: HTMLElement[] = []

  // チャンネルの展開を変更する前後で位置が変わる要素
  const flipElements: HTMLElement[] = []

  // チャンネルの展開を変更する前から flatItems には存在していたが画面外にあった要素で、展開を操作した時に画面内に戻ってきたもの
  // チャンネルの展開を閉じたときのみ存在しうる
  const reenteredElements: HTMLElement[] = []

  // チャンネルの展開を変更した後に表示される要素について、4種類に分類する
  for (const item of virtualizer.value.getVirtualItems()) {
    const key = String(item.key)
    const element = wrapperRef.value.querySelector<HTMLElement>(
      `[data-key="${key}"]`
    )
    if (!element) continue

    // チャンネルの展開を変更する前の位置
    // 描画範囲にあった要素のみ取得できる
    const preStart = prePositions.get(key)

    // 取得できなかった要素
    if (preStart === undefined) {
      if (!preKeys.has(key)) {
        // チャンネルの展開を変更する前に存在しなかった要素は、展開後に新たに表示される要素
        // アニメーションのため、最初は透明にしておき、newElementsに追加
        element.style.opacity = '0'
        element.style.zIndex = '1'
        newElements.push(element)
      } else {
        // チャンネルの展開を変更する前に存在していたが、描画範囲外にあった要素は、展開を切り替えた時に画面内に戻ってきたもの
        // reenteredElementsに追加
        reenteredElements.push(element)
      }
      continue
    }

    // 位置が変化していない要素は、アニメーション不要なのでスキップ
    if (preStart === item.start) continue

    // 位置が変化している要素は、flipElementsに追加
    flipElements.push(element)
  }

  const slideDuration = 150

  // 正 = チャンネルを開いてサイズが増加、負 = チャンネルを閉じてサイズが減少
  const totalSizeDelta = virtualizer.value.getTotalSize() - preTotalSize

  // アニメーションの開始位置（チャンネルの展開を変更する前の位置）に移動させる
  for (const element of flipElements) {
    element.style.transform = `translateY(${-totalSizeDelta}px)`
    element.style.transition = 'none'
  }

  // reenteredElementsはチャンネルを閉じたときのみ現れうる
  if (totalSizeDelta < 0) {
    for (const element of reenteredElements) {
      element.style.transform = `translateY(${-totalSizeDelta}px)`
      element.style.transition = 'none'
    }
  }

  // アニメーションの前に、元の位置に戻した状態でいったん描画する
  void (flipElements[0] ?? reenteredElements[0] ?? newElements[0])?.offsetHeight

  // アニメーションを開始する
  for (const element of flipElements) {
    element.style.transition = `transform ${slideDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
    element.style.transform = 'translateY(0px)'
  }

  if (totalSizeDelta < 0) {
    for (const element of reenteredElements) {
      element.style.transition = `transform ${slideDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
      element.style.transform = 'translateY(0px)'
    }
  }

  // flipElements・reenteredElements のアニメーションが終わったら、transformとtransitionを削除する
  if (flipElements.length > 0 || reenteredElements.length > 0) {
    setTimeout(() => {
      for (const element of flipElements) {
        element.style.transform = ''
        element.style.transition = ''
      }
      for (const element of reenteredElements) {
        element.style.transform = ''
        element.style.transition = ''
      }
    }, slideDuration + 10)
  }

  // チャンネルを閉じたときは新たに表示される要素がないため、フェードインアニメーションは不要
  if (newElements.length === 0) return

  // チャンネルの展開を変更した後も描画される要素のキー
  const postKeys = new Set(
    virtualizer.value.getVirtualItems().map(item => String(item.key))
  )

  // チャンネルの展開を変更したとき、展開を変更する前には存在していたが、展開後に描画範囲外へ押し出された要素があるかどうか
  const hasDisappeared = [...prePositions.keys()].some(
    key => !postKeys.has(key)
  )

  const fadeDuration = 60
  if (flipElements.length > 0 || !hasDisappeared) {
    // チャンネル展開のスライドアニメーションがあるので
    // 新たに表示される子チャンネルのフェードインのタイミングをずらす
    const stagger = Math.floor(
      slideDuration / Math.max(newElements.length + 1, 1)
    )
    newElements.forEach((element, i) => {
      setTimeout(() => {
        element.style.transition = `opacity ${fadeDuration}ms ease`
        element.style.opacity = '1'
        setTimeout(() => {
          element.style.opacity = ''
          element.style.transition = ''
          element.style.zIndex = ''
        }, fadeDuration + 10)
      }, i * stagger)
    })
  } else {
    // 一斉にフェードインする
    for (const element of newElements) {
      element.style.transition = `opacity ${fadeDuration}ms ease`
      element.style.opacity = '1'
    }
    setTimeout(() => {
      for (const element of newElements) {
        element.style.opacity = ''
        element.style.transition = ''
        element.style.zIndex = ''
      }
    }, fadeDuration + 10)
  }
}
</script>

<style lang="scss" module>
.inner {
  position: relative;
  transition: height 150ms ease;
}
.element {
  margin: 0;
}
</style>
