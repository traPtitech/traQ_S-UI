import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))

interface RunnerEvent {
  type: string
  action?: string
  code?: number
  content?: string
  args?: string[]
}

const interruptRunner = (signal: string, phase = 'playwright') =>
  new Promise<{
    code: number | null
    events: RunnerEvent[]
    output: string
  }>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(testDir, 'fixtures/signal-runner.mjs')],
      {
        cwd: path.resolve(testDir, '../../..'),
        env: { ...process.env, CI: 'true', SIGNAL_PHASE: phase },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        timeout: 15_000,
        killSignal: 'SIGKILL'
      }
    )
    const events: RunnerEvent[] = []
    let output = ''
    child.stdout?.on('data', chunk => (output += chunk))
    child.stderr?.on('data', chunk => (output += chunk))
    child.on('message', (event: RunnerEvent) => {
      events.push(event)
      if (event.type === 'ready') child.send(signal)
    })
    child.once('error', reject)
    child.once('close', code => resolve({ code, events, output }))
  })

describe('E2E runner shutdown', () => {
  it.each([
    { signal: 'SIGTERM', exitCode: 143 },
    { signal: 'SIGINT', exitCode: 130 }
  ])(
    'waits for cleanup before exiting on $signal',
    async ({ signal, exitCode }) => {
      const result = await interruptRunner(signal)
      expect(result.code, result.output).toBe(exitCode)
      expect(result.events).toContainEqual({
        type: 'logs-written',
        content: 'backend logs'
      })
      expect(result.events.filter(event => event.action === 'down')).toEqual([
        {
          type: 'docker-close',
          action: 'down',
          code: 0,
          args: ['down', '--volumes', '--remove-orphans']
        }
      ])
    },
    20_000
  )

  it('does not interrupt cleanup when SIGTERM arrives during teardown', async () => {
    const result = await interruptRunner('SIGTERM', 'cleanup')
    expect(result.code, result.output).toBe(143)
    expect(result.events.filter(event => event.action === 'down')).toEqual([
      {
        type: 'docker-close',
        action: 'down',
        code: 0,
        args: ['down', '--volumes', '--remove-orphans']
      }
    ])
  }, 20_000)
})
