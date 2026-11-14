import type { ObjectDirective } from 'vue'

import { buildFilePath } from '/@/lib/apis'
import { parseColor } from '/@/lib/basic/color'
import {
  getRelativeLuminance,
  getStampShadow,
  waitForStampAnalysisIdle
} from '/@/lib/stampShadow'
import { useStampsStore } from '/@/store/entities/stamps'
import type { FileId } from '/@/types/entity-ids'

type StampElement = {
  element: HTMLElement
  fileId: FileId
  analyzedTheme?: number
}

const roots = new WeakMap<HTMLElement, StampElement[]>()
const stamps = new WeakMap<Element, StampElement>()
const visibleStamps = new Set<StampElement>()
const pendingStamps = new Set<StampElement>()
let observer: IntersectionObserver | undefined
let enabled = false
let themeVersion = 0
let activeTasks = 0
let idleScheduled = false
const maxActiveTasks = 4

const getBackgroundLuminance = (element: HTMLElement) => {
  let r = 0
  let g = 0
  let b = 0
  let remaining = 1

  for (
    let parent = element.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent)
    if (style.backgroundImage !== 'none') return

    const color = parseColor(style.backgroundColor)
    if (color?.type !== 'rgb') return

    const weight = remaining * color.a
    r += color.r * weight
    g += color.g * weight
    b += color.b * weight
    if (color.a === 1) return getRelativeLuminance(r, g, b)

    remaining -= weight
  }
}

const analyzeStamp = async (stamp: StampElement, version: number) => {
  const { element, fileId } = stamp
  const backgroundLuminance = getBackgroundLuminance(element)
  const shadow =
    backgroundLuminance === undefined
      ? undefined
      : await getStampShadow(fileId, backgroundLuminance)

  if (themeVersion !== version || stamps.get(element) !== stamp) return

  if (shadow) element.dataset['stampShadow'] = shadow
}

const processPendingStamps = () => {
  if (
    idleScheduled ||
    activeTasks >= maxActiveTasks ||
    pendingStamps.size === 0
  ) {
    return
  }

  idleScheduled = true
  void waitForStampAnalysisIdle().then(() => {
    idleScheduled = false
    const stamp = pendingStamps.values().next().value
    if (!stamp) return

    pendingStamps.delete(stamp)
    const version = themeVersion
    stamp.analyzedTheme = version
    activeTasks++
    void analyzeStamp(stamp, version).finally(() => {
      activeTasks--
      processPendingStamps()
    })

    processPendingStamps()
  })
}

// テーマ変更時は画像の解析結果を使い回し、背景とのコントラストを再計算する。
export const updateStampShadowTheme = (stampEdgeEnabled: boolean) => {
  enabled = stampEdgeEnabled
  themeVersion++
  pendingStamps.clear()

  for (const stamp of visibleStamps) {
    delete stamp.element.dataset['stampShadow']
    if (enabled) pendingStamps.add(stamp)
  }

  processPendingStamps()
}

const getObserver = () => {
  if (!observer && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const stamp = stamps.get(entry.target)
        if (!stamp) continue

        if (entry.isIntersecting) {
          visibleStamps.add(stamp)
          if (enabled && stamp.analyzedTheme !== themeVersion) {
            delete stamp.element.dataset['stampShadow']
            pendingStamps.add(stamp)
          }
        } else {
          visibleStamps.delete(stamp)
          pendingStamps.delete(stamp)
        }
      }

      processPendingStamps()
    })
  }

  return observer
}

const unobserveStamps = (root: HTMLElement) => {
  for (const stamp of roots.get(root) ?? []) {
    const { element } = stamp
    observer?.unobserve(element)
    stamps.delete(element)
    visibleStamps.delete(stamp)
    pendingStamps.delete(stamp)
    delete element.dataset['stampShadow']
  }

  roots.delete(root)
}

const observeStamps = (root: HTMLElement, value: string | undefined) => {
  if (!value) return

  const observed: StampElement[] = []
  const observe = (element: HTMLElement, fileId: FileId) => {
    const stamp = { element, fileId }
    stamps.set(element, stamp)
    observed.push(stamp)
    getObserver()?.observe(element)
  }

  if (root instanceof HTMLImageElement) {
    observe(root, value)
  } else {
    const elements = root.querySelectorAll<HTMLElement>(
      '.message-emoji[style*="background-image"]'
    )

    if (elements.length === 0) return

    const { getStampByName } = useStampsStore()

    for (const element of elements) {
      const stamp = getStampByName(element.title.slice(1, -1))
      if (
        !stamp ||
        element.style.backgroundImage !==
          `url("${buildFilePath(stamp.fileId)}")`
      ) {
        continue
      }

      if (stamp.isUnicode) {
        element.dataset['stampShadow'] = 'none'
        continue
      }

      observe(element, stamp.fileId)
    }
  }

  roots.set(root, observed)
}

export const stampShadowDirective: ObjectDirective<
  HTMLElement,
  string | undefined
> = {
  mounted(root, { value }) {
    observeStamps(root, value)
  },
  updated(root, { value, oldValue }) {
    if (value === oldValue) return

    unobserveStamps(root)
    observeStamps(root, value)
  },
  unmounted: unobserveStamps
}
