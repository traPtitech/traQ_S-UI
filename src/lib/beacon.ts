import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'

/**
 * 実際にはリクエストを送信せず，Axios の生成する config だけを抽出するためのアダプタ
 */
const dummyAdapter: AxiosAdapter = async (
  config: InternalAxiosRequestConfig
) => {
  return {
    data: {},
    status: 0,
    statusText: '',
    headers: {},
    config
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AxiosRequestFn = (...args: any[]) => Promise<AxiosResponse>

/**
 * Axios の生成する config を抽出するヘルパー
 *
 * @param request: 対象となる `apis` 以下のメソッド
 * @param ...args: config を構成するためのパラメータ
 *
 * @returns Axios が生成する config
 */
const getConfig = async <Fn extends AxiosRequestFn>(
  request: Fn,
  ...args: Parameters<Fn>
) => {
  const { config } = await request(...args, { adapter: dummyAdapter })
  return config
}

/**
 * navigator.sendBeacon の代替として，keep-alive な fetch リクエストを同期的に行う
 * fetchLater が widely-available になるまでのワークアラウンド
 *
 * @param request: 模倣する `apis` 以下のメソッド
 * @param ...args: リクエストに必要な config を構成するためのパラメータ
 *
 * @returns 実際にリクエストを同期的に実行する関数
 */
const createBeaconDispatcher = async <Fn extends AxiosRequestFn>(
  request: Fn,
  ...args: Parameters<Fn>
) => {
  const config = await getConfig(request, ...args)
  return () => {
    if (!config.url) return
    fetch(config.url, {
      ...config,
      body: config.data,
      keepalive: true
    }).then(({ ok, statusText }) => {
      if (!ok) throw new Error(statusText)
    })
  }
}

export default createBeaconDispatcher
