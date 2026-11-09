import type { Locator } from '@playwright/test'

import { childId, trailingId } from '../data'
import { sampleRows } from '../geometry'
import { expect, expectCovered, row, test } from '../support'

const checkTreeAnimation = async (
  scroller: Locator,
  direction: 'expand' | 'collapse',
  scrollTo?: number
) => {
  await expect(row(scroller, '/branch').getByRole('button')).toBeInViewport()

  const sample = await scroller.evaluate(sampleRows, {
    animation: { direction, toggleSelector: '[data-key="/branch"] button' },
    scrollTo
  })

  const animatedFrames = sample.frames.filter(
    frame => frame.animation === direction
  )

  expect(
    animatedFrames.length,
    `sampled the running ${direction} animation`
  ).toBeGreaterThan(0)

  if (scrollTo !== undefined) {
    expect(
      animatedFrames.some(frame => Math.abs(frame.scrollTop - scrollTo) <= 1),
      `sampled the scroll during the ${direction} animation`
    ).toBe(true)
  }

  expectCovered(sample)
}

for (const topics of [false, true]) {
  test(`先頭で展開したツリーを折りたたみながらスクロールしても表示領域が行で埋まる (トピック表示: ${topics})`, async ({
    load
  }) => {
    const scroller = await load({ view: 'tree', scenario: 'tree', topics })

    await checkTreeAnimation(scroller, 'expand')

    await expect(row(scroller, `/branch/${childId(0)}`)).toBeVisible()

    await expect(row(scroller, '/branch').getByRole('link')).toHaveAttribute(
      'aria-expanded',
      'true'
    )

    await checkTreeAnimation(scroller, 'collapse', 5000)

    await expect(scroller.locator('[data-key^="/branch/"]')).toHaveCount(0)

    await expect(
      scroller.locator('[data-key^="/trailing-"]').first()
    ).toBeVisible()
  })

  test(`大きなツリーを展開しながらスクロールしても表示領域が行で埋まる (トピック表示: ${topics})`, async ({
    load
  }) => {
    const scroller = await load({ view: 'tree', scenario: 'tree', topics })

    await checkTreeAnimation(scroller, 'expand', 8000)
  })
}

test('素早く連続して開閉しても各行が過不足なく表示される', async ({ load }) => {
  const scroller = await load({ view: 'tree', scenario: 'tree', topics: false })
  const toggle = row(scroller, '/branch').getByRole('button')
  const sampling = scroller.evaluate(sampleRows, { duration: 1000 })
  await toggle.focus()

  for (let i = 0; i < 4; i++) await toggle.press('Enter')

  await expect(row(scroller, '/branch').getByRole('link')).toHaveAttribute(
    'aria-expanded',
    'false'
  )

  expectCovered(await sampling)
  await expect(scroller.locator('[data-key^="/branch/"]')).toHaveCount(0)
  await expect(row(scroller, `/${trailingId(0)}`)).toBeVisible()
})

test('子チャンネルを個別に展開し、検索結果に重複して現れるチャンネルを区別する', async ({
  load,
  page
}) => {
  const scroller = await load({ scenario: 'tree', topics: false, count: 3 })
  await page.getByRole('textbox').fill('child')

  const child = row(scroller, `/${childId(0)}`)
  await child.getByRole('button').click()

  const nested = row(scroller, `/${childId(0)}/grandchild`)
  const matched = row(scroller, '/grandchild')
  await expect(nested).toBeVisible()
  await expect(matched).toBeVisible()
  await expect(nested.getByRole('link')).toHaveAttribute('href', /grandchild/)
  await expect(matched.getByRole('link')).toHaveAttribute('href', /grandchild/)
  expectCovered(await scroller.evaluate(sampleRows, { duration: 250 }))
})
