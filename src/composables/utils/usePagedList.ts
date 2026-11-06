import type { WatchSource } from 'vue'
import {
  computed,
  onScopeDispose,
  readonly,
  ref,
  shallowRef,
  toValue,
  watch
} from 'vue'

import type { MaybePromise } from '/@/types/utility'

import useAsyncScope from './useAsyncScope'
import useLatestRequest from './useLatestRequest'

export type PageLoadKind = 'previous' | 'next' | 'around' | 'latest' | 'catchUp'

export interface ListPage<Item, Cursor> {
  items: Item[]
  cursor: Cursor
  reachedStart?: boolean
  reachedEnd?: boolean
}

export interface PageContext<Source, Cursor> {
  source: Source
  cursor: Cursor
  kind: PageLoadKind
  signal: AbortSignal
}

export type PageLoader<Item, Cursor, Source> = (
  context: PageContext<Source, Cursor>
) => Promise<ListPage<Item, Cursor>>

interface PagedListOptions<Item, Cursor, Source> {
  source: WatchSource<Source>
  initialCursor: () => Cursor

  /** 初回の取得種別。既定値は latest。latest の loader がなければ previous を使う。 */
  initialLoadKind?: (source: Source) => PageLoadKind

  key: (item: Item) => PropertyKey
  load: Partial<Record<PageLoadKind, PageLoader<Item, Cursor, Source>>>

  prepare?: (items: Item[], signal: AbortSignal) => MaybePromise<void>

  ready?: Promise<void>

  autoLoad?: boolean

  onReset?: () => void
}

/**
 * 現在の source に対する一覧、カーソル、前後の到達状態を管理するページ取得用 composable。
 *
 * previous / latest は先頭へ、next / catchUp は末尾へ追加し、around は一覧を置き換える。
 * マージ後は key が重複する項目の先頭だけを残す。並び替えは行わず loader の表示順を使う。
 * prepare が完了して取得がまだ有効な場合だけ一覧とページ状態をまとめて確定する。
 *
 * 一度に実行する loader は1つ。通常の load は実行中の要求を破棄し、catchUp だけを1回分保留する。
 * 取得や準備の失敗は error に保持し、直接実行した取得の Promise も reject する。
 */
const usePagedList = <Item, Cursor, Source>(
  options: PagedListOptions<Item, Cursor, Source>
) => {
  const scope = useAsyncScope()
  const items = shallowRef<Item[]>([])
  const cursor = shallowRef<Cursor>(options.initialCursor())

  const reachedStart = ref(false)
  const reachedEnd = ref(false)

  // 最新側の未取得区間は、過去方向の取得成功や共通の error の解除では解消しない。
  const needsCatchUp = ref(false)

  const lastLoadKind = ref<PageLoadKind>('latest')

  const catchUpRequested = ref(false)
  const hasLoadedPage = ref(false)
  type Request = { kind: PageLoadKind; source?: Source }
  let initialRequest: Request | undefined

  const loaderFor = (kind: PageLoadKind) =>
    options.load[kind] ??
    (kind === 'latest' ? options.load.previous : undefined)

  const request = shallowRef<Request>({ kind: 'latest' })

  const invalidate = () => {
    scope.invalidate()
    catchUpRequested.value = false
    needsCatchUp.value = false
  }

  watch(options.source, invalidate, { flush: 'sync' })
  onScopeDispose(invalidate)

  const task = useLatestRequest({
    source: () => ({ source: toValue(options.source), request: request.value }),
    autoLoad: false,

    fetch: async ({ source, request }, signal) => {
      if (options.ready) {
        await options.ready
        signal.throwIfAborted()
      }

      const loader = loaderFor(request.kind)
      if (!loader) throw new Error(`No loader for ${request.kind}`)

      const page = await loader({
        source: request.source ?? source,
        cursor: cursor.value,
        kind: request.kind,
        signal
      })

      signal.throwIfAborted()

      if (options.prepare) {
        await options.prepare(page.items, signal)
        signal.throwIfAborted()
      }

      return page
    },

    onSuccess: (page, { request: { kind } }) => {
      const ordered =
        kind === 'around'
          ? page.items
          : kind === 'previous' || kind === 'latest'
            ? [...page.items, ...items.value]
            : [...items.value, ...page.items]

      const seen = new Set<PropertyKey>()

      items.value = ordered.filter(item => {
        const key = options.key(item)
        if (seen.has(key)) return false
        seen.add(key)

        return true
      })

      cursor.value = page.cursor

      if (page.reachedStart !== undefined) {
        reachedStart.value = page.reachedStart
      }

      if (page.reachedEnd !== undefined) reachedEnd.value = page.reachedEnd
      else if (kind === 'latest') reachedEnd.value = true

      if (
        (kind === 'latest' && page.reachedEnd !== false) ||
        (kind !== 'previous' && page.reachedEnd === true)
      ) {
        needsCatchUp.value = false
      }

      lastLoadKind.value = kind
      hasLoadedPage.value = true
    }
  })

  const isLoading = computed(
    () => task.isLoading.value || catchUpRequested.value
  )

  const isCaughtUp = computed(
    () =>
      hasLoadedPage.value &&
      reachedEnd.value &&
      !needsCatchUp.value &&
      !catchUpRequested.value
  )

  const load = (kind: PageLoadKind, source?: Source) => {
    // 初回取得に失敗した場合は、スクロール方向にかかわらず同じ表示位置から再試行する。
    if (!hasLoadedPage.value && initialRequest && kind !== 'around') {
      kind = initialRequest.kind
      source = initialRequest.source
    }

    if (
      kind === 'next' &&
      reachedEnd.value &&
      needsCatchUp.value &&
      options.load.catchUp
    ) {
      kind = 'catchUp'
    }

    if (!loaderFor(kind) || isLoading.value) return Promise.resolve(undefined)

    if (kind === 'previous' && reachedStart.value)
      return Promise.resolve(undefined)

    if (kind === 'next' && isCaughtUp.value) return Promise.resolve(undefined)

    if (kind === 'around' && (reachedStart.value || reachedEnd.value))
      return Promise.resolve(undefined)

    request.value = { kind, source }
    if (!hasLoadedPage.value) initialRequest = request.value
    if (kind === 'latest' || kind === 'catchUp') needsCatchUp.value = true
    const isCurrent = scope.capture()

    return task.execute().finally(() => {
      if (isCurrent() && catchUpRequested.value) {
        catchUpRequested.value = false

        void requestCatchUp().catch(() => undefined)
      }
    })
  }

  /**
   * 即時に実行した取得の完了を返す。取得中なら1回分だけ予約してすぐに返す。
   * 予約分を含む処理中の状態は isLoading、失敗は error で確認する。
   */
  const requestCatchUp = () => {
    if (!options.load.catchUp) {
      return Promise.resolve(undefined)
    }

    if (isLoading.value) {
      catchUpRequested.value = true

      if (reachedEnd.value) needsCatchUp.value = true

      return Promise.resolve(undefined)
    }

    if (!reachedEnd.value && !needsCatchUp.value)
      return Promise.resolve(undefined)

    needsCatchUp.value = true

    return load(hasLoadedPage.value ? 'catchUp' : 'latest')
  }

  const invalidateLatest = () => {
    if (!reachedEnd.value && !needsCatchUp.value) return

    needsCatchUp.value = true
    if (isLoading.value) catchUpRequested.value = true
  }

  const reset = () => {
    invalidate()
    task.reset()
    hasLoadedPage.value = false
    initialRequest = undefined
    items.value = []
    cursor.value = options.initialCursor()
    reachedStart.value = false
    reachedEnd.value = false
    lastLoadKind.value = 'latest'
    options.onReset?.()
  }

  const init = () => {
    const kind = options.initialLoadKind?.(toValue(options.source)) ?? 'latest'

    return load(kind)
  }

  if (options.autoLoad !== false) {
    watch(
      options.source,
      () => {
        reset()
        void init().catch(() => undefined)
      },
      { immediate: true }
    )
  }

  return {
    items: computed<readonly Item[]>(() => items.value),
    cursor: computed(() => cursor.value),
    reachedStart: readonly(reachedStart),
    reachedEnd: readonly(reachedEnd),
    needsCatchUp: readonly(needsCatchUp),
    isCaughtUp,
    lastLoadKind: readonly(lastLoadKind),
    isLoading,
    error: task.error,
    capture: scope.capture,
    getSignal: scope.getSignal,
    load,
    updateItems: (update: (items: readonly Item[]) => Item[]) => {
      items.value = update(items.value)
    },
    invalidateLatest,
    requestCatchUp,
    reset,
    init
  }
}

export default usePagedList
