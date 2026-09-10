/* eslint-disable no-console */
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)

let title = ''
let allowFixup = false

if (args.length === 2) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  title = args[1]!
} else if (args.length === 1) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const commitMessagePath = args[0]!
  title = readFileSync(commitMessagePath, 'utf8').split(/\r?\n/)[0] ?? ''
  allowFixup = true
}

title = (title ?? '').trim()

export const CATEGORIES = {
  feat: '機能改善',
  fix: 'バグ修正',
  docs: 'その他',
  style: 'その他',
  refactor: 'その他',
  perf: 'その他',
  test: 'その他',
  build: 'その他',
  ci: 'その他',
  chore: 'その他',
  revert: 'その他'
} as const

const conventionalCommitMessagePattern = new RegExp(
  `^(${Object.keys(CATEGORIES).join('|')})(\\([a-zA-Z0-9_-]+\\))?(!)?: [^\\r\\n]+$`,
  'i'
)

const mergeCommitMessagePattern = /^Merge /
const fixupCommitMessagePattern = /^fixup! /

if (!title) {
  console.error('Cannot validate empty commit/PR title.')
  process.exit(1)
}

if (mergeCommitMessagePattern.test(title)) {
  process.exit(0)
}

if (allowFixup && fixupCommitMessagePattern.test(title)) {
  process.exit(0)
}

if (!conventionalCommitMessagePattern.test(title)) {
  console.error(`Invalid title: "${title}"`)
  console.error(
    'Title must follow Conventional Commits format, for example: "feat(auth): add login flow". \n' +
      'See https://www.conventionalcommits.org/.'
  )

  process.exit(1)
}
