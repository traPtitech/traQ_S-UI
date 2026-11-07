import {
  createChannelTreeAnimation,
  getVisibleChannelTreeAnimation,
  resizeChannelTreeAnimation
} from '/@/components/Main/NavigationBar/ChannelList/channelTreeAnimation'
import type { VirtualChannelRow } from '/@/components/Main/NavigationBar/ChannelList/channelTreeAnimation'
import type { ChannelId } from '/@/types/entity-ids'

const makeRows = (keys: string[], scrollMargin: number): VirtualChannelRow[] =>
  keys.map((key, index) => ({
    key,
    item: {
      key,
      depth: key.startsWith('/root/') ? 1 : 0,
      node: {
        id: key as ChannelId,
        name: key,
        active: true,
        archived: false,
        children: []
      }
    },
    vItem: {
      key,
      index,
      start: scrollMargin + index * 36,
      end: scrollMargin + (index + 1) * 36,
      size: 36,
      lane: 0
    }
  }))

const setup = (direction: 'expand' | 'collapse', scrollMargin = 48) => {
  const children = Array.from(
    { length: 1000 },
    (_, index) => `/root/child-${index}`
  )
  const trailing = Array.from(
    { length: 1000 },
    (_, index) => `/sibling-${index}`
  )
  const expanded = makeRows(['/root', ...children, ...trailing], scrollMargin)
  const collapsed = makeRows(['/root', ...trailing], scrollMargin)
  const isExpanding = direction === 'expand'
  return createChannelTreeAnimation({
    id: 1,
    direction,
    origin: 36,
    scrollMargin,
    preRows: isExpanding ? collapsed : expanded,
    postRows: isExpanding ? expanded : collapsed,
    retainedKeys: new Set(['/root', '/root/child-0', '/sibling-0']),
    preExpandedNodeKeys: new Set(isExpanding ? [] : ['/root']),
    expandedNodeKeys: new Set(isExpanding ? ['/root'] : []),
    postTotalSize: (isExpanding ? expanded.length : collapsed.length) * 36,
    totalSizeDelta: isExpanding ? 36000 : -36000,
    descendantKeyPrefix: '/root/'
  })
}

describe('channelTreeAnimation', () => {
  it.each(['expand', 'collapse'] as const)(
    '%s中、現在のクリップ境界を使って子行と後続行を仮想化する',
    direction => {
      const snapshot = setup(direction)
      const animation = getVisibleChannelTreeAnimation(
        snapshot,
        18000,
        18360,
        20000,
        5
      )

      expect(animation.rows.some(row => row.key === '/root/child-500')).toBe(
        true
      )
      expect(animation.rows.length).toBeLessThan(25)
      expect(animation.movingRows.map(row => row.key)).toEqual(['/sibling-0'])
      expect(
        animation.rows.find(row => row.key === '/root/child-500')?.index
      ).toBe(direction === 'expand' ? 501 : undefined)
    }
  )

  it('まだ下へ移動しきっていない後続行を、完了後の座標とは別の範囲から選ぶ', () => {
    const snapshot = setup('expand')
    const animation = getVisibleChannelTreeAnimation(snapshot, 9000, 9360, 0, 5)

    expect(animation.movingRows.some(row => row.key === '/sibling-250')).toBe(
      true
    )
    expect(animation.movingRows.length).toBeLessThan(25)
    expect(animation.rows.map(row => row.key)).toEqual(['/root/child-0'])
  })

  it('クリップ範囲より下にある子行を描画しない', () => {
    const snapshot = setup('collapse')
    const animation = getVisibleChannelTreeAnimation(
      snapshot,
      18000,
      18360,
      300,
      5
    )

    expect(animation.rows.map(row => row.key)).toEqual(['/root/child-0'])
    expect(animation.movingRows.length).toBeLessThan(25)
  })

  it('目標の高さを補正した直後も、CSS が描画している実際の高さを使う', () => {
    const snapshot = setup('expand')
    const animation = getVisibleChannelTreeAnimation(
      snapshot,
      40036,
      40396,
      40000,
      5
    )

    expect(animation.movingRows.some(row => row.key === '/sibling-1')).toBe(
      true
    )
    expect(animation.movingRows.length).toBeLessThan(25)
  })

  it('表示前後の行を保持しても、アニメーション行を全件 DOM に載せない', () => {
    const snapshot = setup('expand')
    const animation = getVisibleChannelTreeAnimation(snapshot, 0, 360, 0, 5)

    expect(snapshot.rows).toHaveLength(1000)
    expect(snapshot.movingRows).toHaveLength(1000)
    expect(animation.movingRows[0]?.key).toBe('/sibling-0')
    expect(animation.rows.length + animation.movingRows.length).toBeLessThan(30)
  })

  it('トピックの実測で高さが変わった場合、各レイヤーの後続行の位置を補正する', () => {
    const snapshot = setup('expand')
    const resized = resizeChannelTreeAnimation(snapshot, [
      { key: '/root/child-0', size: 72 },
      { key: '/sibling-0', size: 60 }
    ])

    expect(resized.id).toBe(snapshot.id)
    expect(resized.height).toBe(36036)
    expect(resized.rows[1]?.start).toBe(72)
    expect(resized.movingRows[1]?.start).toBe(60)
    expect(resized.trailingHeight).toBe(snapshot.trailingHeight + 24)
    expect(snapshot.rows[1]?.start).toBe(36)
  })
})
