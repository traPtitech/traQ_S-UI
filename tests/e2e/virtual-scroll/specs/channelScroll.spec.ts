import { flatId, longTopic } from '../data'
import { sampleRows } from '../geometry'
import {
  expect,
  expectCovered,
  row,
  scrollAndCheckCoverage,
  test
} from '../support'

test('固定高の行を仮想化し、大きな一覧の先頭と末尾へ移動できる', async ({
  load
}) => {
  const scroller = await load({ view: 'tree', topics: false })

  await scrollAndCheckCoverage(scroller, 18000, 0)

  const height = await scroller.evaluate(el => el.scrollHeight)
  await scrollAndCheckCoverage(scroller, height, 0)
  await expect(row(scroller, `/${flatId(1199)}`)).toBeVisible()

  await scrollAndCheckCoverage(scroller, 0, 0)
  await expect(row(scroller, `/${flatId(0)}`)).toBeVisible()
})

test('検索後に未計測のトピック行へスクロールしても表示領域が行で埋まる', async ({
  load
}) => {
  const scroller = await load()
  await scroller.getByRole('textbox').fill('channel')
  await scroller.getByRole('textbox').blur()

  // 未計測のトピック行へのスクロールを再現するため、Markdown の描画・高さ計測中に移動を始める。
  await scrollAndCheckCoverage(scroller, 14000, 0)
  await scrollAndCheckCoverage(scroller, 11600)
  await scrollAndCheckCoverage(scroller, 17000)
})

test('タッチ操作中の高さ変更が停止時のスクロール補正に持ち越されない @touch', async ({
  page,
  load
}) => {
  const scroller = await load({ topics: false })
  await scroller.getByRole('textbox').fill('channel')
  await scroller.getByRole('textbox').blur()
  await scrollAndCheckCoverage(scroller, 14000, 0)

  const key = await scroller.evaluate(el => {
    const top = el.getBoundingClientRect().top
    return [...el.querySelectorAll<HTMLElement>('[data-key]')].findLast(
      row => row.getBoundingClientRect().bottom <= top
    )?.dataset['key']
  })
  if (!key) throw new Error('Missing row above the viewport')

  const changedRow = row(scroller, key)
  const initialHeight = await changedRow.evaluate(
    el => el.getBoundingClientRect().height
  )
  const inputOffset = await scroller.evaluate(el => {
    el.style.overflowAnchor = 'none'
    el.dispatchEvent(new TouchEvent('touchstart'))
    el.scrollTop += 1
    return el.scrollTop
  })

  await page.evaluate(
    ({ id, topic }) => window.virtualScrollHarness.setTopic(id, topic),
    { id: key.slice(1), topic: longTopic }
  )

  await expect
    .poll(() => changedRow.evaluate(el => el.getBoundingClientRect().height))
    .toBeGreaterThan(initialHeight)

  const offsets = await scroller.evaluate(async el => {
    // 高さの変化が仮想スクロールに反映されるまで、タッチを継続する。
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })

    const offsets = [el.scrollTop]
    const recordOffset = () => offsets.push(el.scrollTop)
    el.addEventListener('scroll', recordOffset)

    try {
      el.dispatchEvent(new TouchEvent('touchend'))
      await new Promise(resolve => setTimeout(resolve, 450))
      return [...offsets, el.scrollTop]
    } finally {
      el.removeEventListener('scroll', recordOffset)
    }
  })

  expect(
    Math.max(...offsets.map(offset => Math.abs(offset - inputOffset)))
  ).toBeLessThanOrEqual(1)
})

test('スクロール後に検索結果が減少・消失・復元しても表示範囲が追従する', async ({
  load
}) => {
  const scroller = await load()
  const input = scroller.getByRole('textbox')
  await input.fill('channel')
  await scrollAndCheckCoverage(scroller, 14000, 0)

  await input.fill('channel-1199')
  await expect(row(scroller, `/${flatId(1199)}`)).toBeVisible()
  await expect(scroller.locator('[data-key]')).toHaveCount(1)

  await input.fill('no-such-channel')
  await expect(scroller.locator('[data-key]')).toHaveCount(0)

  await input.fill('channel')
  await expect(row(scroller, `/${flatId(0)}`)).toBeVisible()
  expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))

  await input.fill('')
  await expect(scroller.getByRole('tab', { name: 'すべて' })).toBeVisible()
  expectCovered(await scroller.evaluate(sampleRows))
})

for (const grow of [true, false]) {
  test(`停止中に表示領域より上のトピックの高さが${grow ? '増えて' : '減って'}も表示中の行の位置を保つ`, async ({
    page,
    load
  }) => {
    const scroller = await load({ view: 'tree' })
    await scrollAndCheckCoverage(scroller, 14000, 0)

    const before = await scroller.evaluate((el, grow) => {
      const top = el.getBoundingClientRect().top
      const rows = [...el.querySelectorAll<HTMLElement>('[data-key]')]

      const changed = rows
        .filter(
          row =>
            row.getBoundingClientRect().bottom <= top &&
            (grow ? row.offsetHeight === 36 : row.offsetHeight > 36)
        )
        .at(-1)

      const anchor = rows.find(row => row.getBoundingClientRect().top >= top)
      if (!changed?.dataset['key'] || !anchor?.dataset['key']) {
        throw new Error('Missing topic or visible anchor')
      }

      return {
        changed: changed.dataset['key'],
        key: anchor.dataset['key'],
        y: anchor.getBoundingClientRect().top,
        height: changed.offsetHeight
      }
    }, grow)

    await page.evaluate(
      ({ id, topic }) => window.virtualScrollHarness.setTopic(id, topic),
      { id: before.changed.slice(1), topic: grow ? longTopic : '' }
    )

    await expect
      .poll(() =>
        row(scroller, before.changed).evaluate(
          el => el.getBoundingClientRect().height
        )
      )
      .not.toBe(before.height)

    await expect
      .poll(async () =>
        Math.abs(
          ((await row(scroller, before.key).boundingBox())?.y ?? NaN) - before.y
        )
      )
      .toBeLessThanOrEqual(1)

    expectCovered(await scroller.evaluate(sampleRows))
  })
}

test('ナビゲーションの幅が変わると折り返すトピックの高さを再計測する', async ({
  page,
  load
}) => {
  const scroller = await load({ view: 'tree' })
  await scrollAndCheckCoverage(scroller, 14000, 0)

  const wrappingKey = await scroller.evaluate(el => {
    const top = el.getBoundingClientRect().top

    return [...el.querySelectorAll<HTMLElement>('[data-key]')].find(
      row =>
        Number(row.dataset['index']) % 4 === 2 &&
        row.getBoundingClientRect().top >= top
    )?.dataset['key']
  })
  if (!wrappingKey) throw new Error('Missing wrapping topic')

  let previousHeight = await row(scroller, wrappingKey).evaluate(
    el => el.getBoundingClientRect().height
  )

  for (const width of [220, 360, 280]) {
    await page.evaluate(
      width => window.virtualScrollHarness.setWidth(width),
      width
    )

    await expect
      .poll(async () => (await scroller.evaluate(sampleRows)).frames[0]?.gap)
      .toBeLessThanOrEqual(1.5)

    if (width !== 280) {
      await expect
        .poll(() =>
          row(scroller, wrappingKey).evaluate(
            el => el.getBoundingClientRect().height
          )
        )
        .not.toBe(previousHeight)

      previousHeight = await row(scroller, wrappingKey).evaluate(
        el => el.getBoundingClientRect().height
      )
    }
  }

  await scrollAndCheckCoverage(scroller, 13500)
})

test('表示領域の縮小・拡大に合わせて描画範囲を更新する', async ({
  page,
  load
}) => {
  const original = page.viewportSize()
  if (!original) throw new Error('Missing viewport size')

  const scroller = await load({ view: 'tree' })
  await scrollAndCheckCoverage(scroller, 14000, 0)

  const height = await scroller.evaluate(el => el.clientHeight)
  await page.setViewportSize({ width: original.width, height: 360 })

  await expect
    .poll(() => scroller.evaluate(el => el.clientHeight))
    .toBeLessThan(height)

  expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))

  await page.setViewportSize(original)
  await expect.poll(() => scroller.evaluate(el => el.clientHeight)).toBe(height)

  await expect
    .poll(async () => (await scroller.evaluate(sampleRows)).frames[0]?.gap)
    .toBeLessThanOrEqual(1.5)

  expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))
})

for (const topics of [false, true]) {
  test(`タブを隠して再表示するとスクロール位置と一覧が復元される (トピック表示: ${topics})`, async ({
    page,
    load
  }) => {
    const scroller = await load({ topics })

    if (topics) {
      await scroller.getByRole('textbox').fill('channel')
      await scroller.getByRole('textbox').blur()
    }

    await scrollAndCheckCoverage(scroller, 14000, 0)

    const before = await scroller.evaluate(el => {
      const bounds = el.getBoundingClientRect()
      const anchor = [...el.querySelectorAll<HTMLElement>('[data-key]')].find(
        row => {
          const rect = row.getBoundingClientRect()
          return rect.top >= bounds.top && rect.bottom <= bounds.bottom
        }
      )

      const key = anchor?.dataset['key']
      if (!anchor || !key) {
        throw new Error('Missing visible anchor')
      }

      return {
        scrollTop: el.scrollTop,
        key,
        y: anchor.getBoundingClientRect().top
      }
    })

    await page.evaluate(() => window.virtualScrollHarness.setVisible(false))
    await expect(scroller).toBeHidden()

    // ResizeObserver が非表示の状態を観測できるよう、再表示までフレームを空ける。
    await page.evaluate(
      () =>
        new Promise(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    )

    await page.evaluate(() => window.virtualScrollHarness.setVisible(true))
    await expect(scroller).toBeVisible()
    await expect(row(scroller, before.key)).toBeVisible()
    await expect
      .poll(() => scroller.evaluate(el => el.scrollTop))
      .toBe(before.scrollTop)

    await expect
      .poll(async () =>
        Math.abs(
          ((await row(scroller, before.key).boundingBox())?.y ?? NaN) - before.y
        )
      )
      .toBeLessThanOrEqual(1)

    expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))
  })
}

test('先行する見出しの高さが変わっても仮想行の座標を揃える', async ({
  page,
  load
}) => {
  const scroller = await load({ view: 'tree', topics: false })

  for (const height of [180, 40, 100]) {
    await page.evaluate(
      height => window.virtualScrollHarness.setHeaderHeight(height),
      height
    )

    await scrollAndCheckCoverage(scroller, 7000, 0)

    const { frames } = await scroller.evaluate(sampleRows)
    const sample = frames[0]
    if (!sample) throw new Error('No frame')

    for (const row of sample.rows) {
      expect(
        Math.abs(row.rawTop - (height + row.index * 36 - sample.scrollTop))
      ).toBeLessThanOrEqual(1)
    }
  }
})

test('ホームのセクションが消えて戻っても後続の一覧を更新する', async ({
  page,
  load
}) => {
  const scroller = await load({ view: 'home', topics: false })
  await page.evaluate(() => window.virtualScrollHarness.setUnread(80))

  const checkList = async (offset: number) => {
    await scroller.evaluate((el, offset) => {
      el.scrollTop = offset
    }, offset)

    // ホームのセクション間の余白を考慮し、見出しを通り過ぎた位置でチャンネル一覧を検証する。
    await expect
      .poll(async () => (await scroller.evaluate(sampleRows)).frames[0]?.gap)
      .toBeLessThanOrEqual(1.5)

    expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))
  }

  await checkList(14000)

  await page.evaluate(() => window.virtualScrollHarness.setUnread(0))
  await checkList(14000)

  await page.evaluate(() => window.virtualScrollHarness.setUnread(20))
  await checkList(12000)
})

test('ネイティブのタッチ入力で大きな検索結果の一覧をスクロールできる @touch @chromium', async ({
  page,
  load
}) => {
  const scroller = await load()
  await scroller.getByRole('textbox').fill('channel')
  await scroller.getByRole('textbox').blur()
  await scrollAndCheckCoverage(scroller, 14000, 0)

  const session = await page.context().newCDPSession(page)

  try {
    const box = await scroller.boundingBox()
    if (!box) throw new Error('Missing viewport')

    const x = box.x + 2,
      y = box.y + 70

    const sampling = scroller.evaluate(sampleRows, { duration: 2200 })

    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }]
    })

    for (let i = 1; i <= 16; i++) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y + i * 20 }]
      })

      await page.waitForTimeout(16)
    }

    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    })

    const sample = await sampling
    expectCovered(sample)

    const tail = sample.frames
      .filter(frame => frame.time > 1800)
      .map(frame => frame.scrollTop)

    expect(tail.length).toBeGreaterThan(1)
    expect(Math.max(...tail) - Math.min(...tail)).toBeLessThanOrEqual(1)
    expect(sample.frames.at(-1)?.scrollTop).toBeLessThan(14000)
  } finally {
    await session.detach()
  }
})
