import { spawn } from 'child_process'
import kill from 'tree-kill'

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

const preview = spawn(npm, ['run', 'serve'])
await new Promise((resolve, reject) => {
  preview.stdout.pipe(process.stdout)
  preview.stderr.pipe(process.stderr)
  preview.on('error', reject)

  preview.stdout.on('data', data => {
    if (data.includes('review server running')) {
      resolve()
    }
  })
})

await runCmd(npm, [
  'run',
  isHeadless ? 'test:e2e:only-run-headless' : 'test:e2e:only-run'
])

if (isHeadless) {
  preview.stdin.pause()
  preview.stdout.pause()
  kill(preview.pid)
}
