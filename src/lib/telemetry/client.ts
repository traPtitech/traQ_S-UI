import type { Faro } from '@grafana/faro-web-sdk'

import { VERSION } from '/@/lib/define'

type TelemetryClient = { faro: Faro; clientId: string }
type TelemetryTarget = { endpoint: string; environment: string }

// Faro の内部エラーが console.error の収集を再帰的に発火させないようにする。
const unpatchedConsole = { ...window.console }
let initialization: Promise<TelemetryClient | undefined> | undefined

const getClientId = () => {
  const key = 'telemetry/client-id'
  const id = crypto.randomUUID()

  try {
    const stored = window.localStorage.getItem(key)
    if (stored) return stored

    window.localStorage.setItem(key, id)
  } catch {}

  return id
}

const getTarget = (): TelemetryTarget | undefined => {
  if (!window.isSecureContext) return

  const config = window.traQConfig?.telemetry
  if (!config?.endpoint) return
  if (config.hosts && !config.hosts.includes(location.hostname)) return

  try {
    const endpoint = new URL(config.endpoint, location.origin)
    if (!['http:', 'https:'].includes(endpoint.protocol)) return
    if (endpoint.origin !== location.origin) return

    return {
      endpoint: endpoint.href,
      environment: config.environment ?? location.hostname
    }
  } catch {
    return
  }
}

const initialize = async ({ endpoint, environment }: TelemetryTarget) => {
  const { initializeFaro, FetchTransport } =
    await import('@grafana/faro-web-sdk')

  const faro = initializeFaro({
    app: {
      name: 'traq-ui',
      version: VERSION,
      environment
    },
    transports: [
      new FetchTransport({
        url: endpoint,
        requestOptions: {
          credentials: 'same-origin',
          mode: 'same-origin',
          redirect: 'error',
          headers: { 'X-Traq-Telemetry': '1' },
          referrerPolicy: 'no-referrer'
        }
      })
    ],
    metas: [],
    instrumentations: [],
    unpatchedConsole,
    sessionTracking: { enabled: false },
    dedupe: false,
    isolate: true,
    preventGlobalExposure: true,
    batching: { sendTimeout: 1000, itemLimit: 20 }
  })

  if (faro) return { faro, clientId: getClientId() }
}

export const isTelemetryEnabled = () => getTarget() !== undefined

export const publish = async (
  write: (api: Faro['api'], clientId: string) => void | Promise<void>
) => {
  const target = getTarget()
  if (!target) return

  initialization ??= initialize(target).catch(() => {
    initialization = undefined
    return undefined
  })

  try {
    const client = await initialization
    if (client) await write(client.faro.api, client.clientId)
  } catch {}
}

export const pauseTelemetry = () => {
  void initialization?.then(client => client?.faro.pause())
}
