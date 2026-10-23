import childProcess from 'node:child_process'
import fs from 'node:fs/promises'
import { registerHooks, syncBuiltinESMExports } from 'node:module'
import process from 'node:process'
import { URL, fileURLToPath } from 'node:url'

const runnerURL = new URL('../../../../scripts/run-e2e.mjs', import.meta.url)
const viteURL = import.meta.resolve('vite')

// Use real Vite signal handling, with no project plugins or fixed server port.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'vite' && context.parentURL === runnerURL.href) {
      const source = `
        import { build, preview as startPreview } from ${JSON.stringify(viteURL)}
        export { build }
        export const preview = options => startPreview({
          ...options,
          configFile: false,
          preview: { ...options.preview, port: 0 }
        })
      `
      return {
        url: `data:text/javascript,${encodeURIComponent(source)}`,
        shortCircuit: true
      }
    }
    return nextResolve(specifier, context)
  }
})

const spawn = childProcess.spawn
childProcess.spawn = (command, args, options) => {
  if (command === 'docker') {
    const action = args[0] === 'info' ? 'info' : args[5]
    const output =
      { info: 'test-docker', port: '127.0.0.1:49152', logs: 'backend logs' }[
        action
      ] ?? ''
    const child = spawn(
      process.execPath,
      [
        '-e',
        `setTimeout(() => process.stdout.write(${JSON.stringify(output)}), 100)`
      ],
      options
    )
    child.once('close', code =>
      process.send({ type: 'docker-close', action, code, args: args.slice(5) })
    )
    if (action === 'down' && process.env['SIGNAL_PHASE'] === 'cleanup') {
      process.send({ type: 'ready' })
    }
    return child
  }
  if (args[0]?.replaceAll('\\', '/').endsWith('@playwright/test/cli.js')) {
    const child = spawn(
      process.execPath,
      [
        '-e',
        process.env['SIGNAL_PHASE'] === 'cleanup'
          ? ''
          : 'setInterval(() => {}, 1000)'
      ],
      options
    )
    if (process.env['SIGNAL_PHASE'] !== 'cleanup') {
      child.once('spawn', () => process.send({ type: 'ready' }))
    }
    return child
  }
  return spawn(command, args, options)
}

const writeFile = fs.writeFile
fs.writeFile = async (file, ...args) => {
  if (String(file).endsWith('.log')) {
    process.send({ type: 'logs-written', content: args[0] })
    return
  }
  return writeFile(file, ...args)
}
syncBuiltinESMExports()

process.on('message', signal => {
  // Use POSIX signals on Unix and the equivalent Node event on Windows.
  if (process.platform === 'win32') process.emit(signal, signal)
  else process.kill(process.pid, signal)
})

process.argv = [process.execPath, fileURLToPath(runnerURL)]
try {
  await import(runnerURL.href)
} finally {
  process.disconnect()
}
