import type { Faro } from '@grafana/faro-web-sdk'

import { VERSION } from '/@/lib/define'

import type { TelemetryEvents } from './events'

type TelemetryClient = { faro: Faro; clientId: string }

let initialization: Promise<TelemetryClient | undefined> | undefined

const getClientId = () => {
  const key = 'telemetry/client-id'
  const id = crypto.randomUUID()
  try {
    const stored = window.localStorage.getItem(key)
    if (stored) return stored
    window.localStorage.setItem(key, id)
  } catch {
    return id
  }
  return id
}

const initialize = async () => {
  const config = traQConfig.telemetry
  if (!config?.endpoint) return

  const endpoint = new URL(config.endpoint, location.origin)
  if (!['http:', 'https:'].includes(endpoint.protocol)) return

  const { initializeFaro, FetchTransport } =
    await import('@grafana/faro-web-sdk')
  const faro = initializeFaro({
    app: {
      name: 'traq-ui',
      version: VERSION,
      environment: config.environment ?? location.hostname
    },
    transports: [
      new FetchTransport({
        url: endpoint.href,
        requestOptions: {
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        }
      })
    ],
    metas: [],
    instrumentations: [],
    sessionTracking: { enabled: false },
    dedupe: false,
    isolate: true,
    preventGlobalExposure: true,
    batching: { sendTimeout: 1000, itemLimit: 20 }
  })
  if (faro) return { faro, clientId: getClientId() }
}

const track = async <Name extends keyof TelemetryEvents>(
  name: Name,
  attributes: TelemetryEvents[Name]
): Promise<void> => {
  const config = traQConfig.telemetry
  if (!config?.endpoint) return
  if (config.hosts && !config.hosts.includes(location.hostname)) {
    return
  }

  const timestamp = Date.now()
  const values = Object.fromEntries(
    Object.entries(attributes)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)])
  )

  try {
    initialization ??= initialize().catch(() => undefined)
    const client = await initialization
    if (!client) return
    client.faro.api.pushEvent(
      name,
      {
        ...values,
        client_id: client.clientId,
        event_id: crypto.randomUUID(),
        schema_version: '1'
      },
      'activity',
      { timestampOverwriteMs: timestamp }
    )
  } catch {
    return
  }
}

export const telemetry = { track }

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void initialization?.then(client => client?.faro.pause())
  })
}
