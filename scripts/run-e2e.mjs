/* eslint-disable no-console */
import { spawn, spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { build, preview } from 'vite'

import { frontendOrigin } from '../tests/e2e/config.ts'

const { values } = parseArgs({
  options: {
    build: { type: 'boolean', default: false },
    ui: { type: 'boolean', default: false },
    spec: { type: 'string' }
  }
})
const root = fileURLToPath(new URL('../', import.meta.url))
const playwrightCLI = path.join(root, 'node_modules/@playwright/test/cli.js')
const project = `traq-ui-e2e-${process.pid}-${randomUUID().slice(0, 8)}`
const composeArgs = [
  'compose',
  '--project-name',
  project,
  '--file',
  path.join(root, 'tests/e2e/compose.yaml')
]
const abort = new AbortController()
let activeChild
let server
let composeStarted = false
let failed = true

const interrupt = signal => {
  if (abort.signal.aborted) return
  process.exitCode = signal === 'SIGINT' ? 130 : 143
  abort.abort(new Error(`E2E interrupted by ${signal}`))
  if (!activeChild?.pid) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(activeChild.pid), '/T', '/F'], {
      stdio: 'ignore'
    })
  } else {
    activeChild.kill('SIGTERM')
  }
}
process.once('SIGINT', interrupt)
process.once('SIGTERM', interrupt)

const run = (
  command,
  args,
  { capture = false, cleanup = false, env = {} } = {}
) =>
  new Promise((resolve, reject) => {
    if (!cleanup) abort.signal.throwIfAborted()
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit'
    })
    activeChild = child
    let output = ''
    child.stdout?.on('data', chunk => {
      output += chunk
    })
    child.once('error', reject)
    child.once('close', code => {
      activeChild = undefined
      if (code === 0) resolve(output.trim())
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    })
  })

const compose = (args, options) =>
  run('docker', [...composeArgs, ...args], options)

try {
  const dockerVersion = await run(
    'docker',
    ['info', '--format', '{{.ServerVersion}}'],
    {
      capture: true
    }
  )
  if (!dockerVersion)
    throw new Error(
      'Docker Engine is unavailable; start Docker before running E2E tests'
    )
  if (values.build) {
    await run(process.execPath, ['build/gen-mplus.js'], {
      env: { MAY_SKIP_FONT_GEN: '1' }
    })
    await build({ root })
  }

  composeStarted = true
  await compose(['up', '--detach', '--wait', '--wait-timeout', '120'])
  const address = await compose(['port', 'backend', '3000'], { capture: true })
  process.env.E2E_BACKEND_URL = `http://${address}`
  abort.signal.throwIfAborted()
  server = await preview({
    root,
    mode: 'e2e',
    preview: {
      host: '127.0.0.1',
      port: Number(new URL(frontendOrigin).port),
      strictPort: true
    }
  })

  const playwrightArgs = [
    playwrightCLI,
    'test',
    ...(values.ui ? ['--ui'] : []),
    ...(values.spec ? [values.spec] : [])
  ]
  await run(process.execPath, playwrightArgs)
  failed = false
} catch (error) {
  console.error(error)
  process.exitCode ||= 1
} finally {
  if (server) {
    try {
      await server.close()
    } catch (error) {
      console.error('Failed to stop the E2E preview server:', error)
      process.exitCode ||= 1
    }
  }
  if (composeStarted) {
    if (failed) {
      try {
        const logs = await compose(['logs', '--no-color', '--timestamps'], {
          capture: true,
          cleanup: true
        })
        const logDir = path.join(root, 'tests/e2e/logs')
        await mkdir(logDir, { recursive: true })
        const logFile = path.join(logDir, `${project}.log`)
        await writeFile(logFile, logs)
        console.error(`E2E backend logs: ${logFile}`)
      } catch (error) {
        console.error('Failed to collect E2E backend logs:', error)
      }
    }
    try {
      await compose(['down', '--volumes', '--remove-orphans'], {
        cleanup: true
      })
    } catch (error) {
      console.error('Failed to remove the E2E environment:', error)
      process.exitCode ||= 1
    }
  }
  process.removeListener('SIGINT', interrupt)
  process.removeListener('SIGTERM', interrupt)
}
