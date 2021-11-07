import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { preview, resolveConfig } from 'vite'

const runCmd = (cmd, args, options) =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, options)
    proc.stderr.pipe(process.stderr)
    proc.stdout.pipe(process.stdout)
    proc.on('error', reject)
    proc.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`child exited with code ${code}`))
      }
    })
  })

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const isHeadless = process.argv[2] === '--headless'

const viteConfig = await resolveConfig(
  {
    root: fileURLToPath(new URL('../../', import.meta.url))
  },
  'serve',
  'production'
)
const previewServer = await preview(viteConfig, { port: 5000 })

await runCmd(
  npm,
  ['run', isHeadless ? 'test:e2e:only-run-headless' : 'test:e2e:only-run'],
  { shell: false }
)

if (isHeadless) {
  previewServer.close()
}
