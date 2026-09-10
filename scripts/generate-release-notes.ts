/* eslint-disable no-console */
import { execSync } from 'node:child_process'
import fs from 'node:fs'

import { Octokit } from '@octokit/rest'

import { CATEGORIES } from './validate-conventional-title'

const OTHER_CATEGORY_LABEL = 'その他' as const
const DEPENDENCIES_CATEGORY_LABEL = '依存関係の更新' as const

const OUTPUT_PATH = 'release-notes.md' as const
const DEPENDENCIES_LABEL_NAME = 'dependencies' as const

type CategoryPrefix = keyof typeof CATEGORIES

type CategoryLabel =
  | (typeof CATEGORIES)[CategoryPrefix]
  | typeof DEPENDENCIES_CATEGORY_LABEL
  | typeof OTHER_CATEGORY_LABEL

const CATEGORY_ORDER: CategoryLabel[] = [
  '機能改善',
  'バグ修正',
  DEPENDENCIES_CATEGORY_LABEL,
  OTHER_CATEGORY_LABEL
] as const

interface ReleaseEntry {
  number: number
  category: CategoryLabel
  summary: string
  authorLogin: string
  isExternal: boolean
  firstContribution: boolean
  mergedAt: string
}

const RELEASE_TAG =
  process.env['RELEASE_TAG'] || process.env['GITHUB_REF_NAME'] || ''
const REPO_FULL = process.env['GITHUB_REPOSITORY']
const TOKEN = process.env['GITHUB_TOKEN']
const RELEASE_BASE_BRANCH = process.env['RELEASE_BASE_BRANCH'] || 'main'

if (!RELEASE_TAG) {
  throw new Error('RELEASE_TAG (or GITHUB_REF_NAME) is required')
}
if (!REPO_FULL) {
  throw new Error('GITHUB_REPOSITORY is required')
}

const [repoOwner, repoName] = REPO_FULL.split('/') as [string, string]
if (!repoOwner || !repoName) {
  throw new Error(`Invalid GITHUB_REPOSITORY: ${REPO_FULL}`)
}

const octokit = new Octokit({
  auth: TOKEN
})

function run(cmd: string): string {
  return execSync(cmd, { encoding: 'utf8' }).trim()
}

function getTagDate(tag: string): string {
  const raw = run(`git log -1 --format=%cI "${tag}"`)
  if (!raw) {
    throw new Error(`Cannot resolve date for tag ${tag}`)
  }
  return raw
}

function getPreviousTag(currentTag: string): string | null {
  const tags = run('git tag --sort=-version:refname "v*"')
    .split(/\r?\n/)
    .filter(Boolean)
  const index = tags.indexOf(currentTag)
  if (index === -1 || index + 1 >= tags.length) {
    return null
  }
  return tags[index + 1] ?? null
}

async function queryMergedPullRequestNumbers(
  since: string | null,
  until: string
): Promise<number[]> {
  const clauses = [
    `repo:${REPO_FULL}`,
    'is:pr',
    'is:merged',
    `base:${RELEASE_BASE_BRANCH}`
  ]
  if (since) {
    clauses.push(`merged:>${since}`)
  }
  clauses.push(`merged:<=${until}`)
  const q = clauses.join(' ')

  const items = await octokit.paginate('GET /search/issues', {
    q,
    per_page: 100,
    sort: 'created',
    order: 'asc'
  })

  const numbers = items
    .map(item => item.number)
    .filter((number): number is number => typeof number === 'number')

  return [...new Set(numbers)]
}

async function getPullRequest(number: number) {
  return octokit.rest.pulls.get({
    owner: repoOwner,
    repo: repoName,
    pull_number: number
  })
}

function parseCategoryAndTitle(rawTitle: string | undefined | null): {
  category: CategoryLabel
  summary: string
} {
  const title = (rawTitle || '').trim()
  const match = title.match(/^([a-zA-Z]+(?:\([^)]*\))?)\s*:\s*(.+)$/)
  if (!match) {
    return { category: 'その他', summary: title || '(no title)' }
  }
  const prefix = match[1]?.split('(')[0]?.toLowerCase() as CategoryPrefix

  return {
    category: CATEGORIES[prefix] || 'その他',
    summary: (match[2] || '').trim() || title
  }
}

function hasDependenciesLabel(
  labels:
    | (
        | {
            name?: string | null
          }
        | string
      )[]
    | undefined
): boolean {
  return (
    labels?.some(label => {
      const labelName = typeof label === 'string' ? label : label?.name
      return labelName?.toLowerCase() === DEPENDENCIES_LABEL_NAME
    }) ?? false
  )
}

function extractOutlineSummary(body: string | null | undefined): string {
  const match = body?.match(/^##\s*Outline\s*\n([\s\S]*?)(?:\n##\s|$)/im)
  if (!match || !match[1]) {
    return ''
  }
  const lines = match[1]
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*[-*]\s+/, '').trim())
    .filter(Boolean)
  return lines[0] || ''
}

function formatMention(login: string | undefined): string {
  if (!login) {
    return '[Unknown](//github.com/unknown)'
  }
  const safe = /^[A-Za-z0-9_-]+$/.test(login)
  return safe
    ? `[@:${login}:](//github.com/${login})`
    : `[@${login}](//github.com/${login})`
}

function isExternalContribution(association: string | undefined): boolean {
  const normalized = (association || '').toUpperCase()
  return !['OWNER', 'MEMBER', 'COLLABORATOR'].includes(normalized)
}

const firstContributionAuthorCache = new Map<string, number | null>()

async function getFirstMergedPrNumberForAuthor(
  login: string
): Promise<number | null> {
  const cached = firstContributionAuthorCache.get(login)
  if (cached !== undefined) return cached

  const q = `repo:${REPO_FULL} is:pr is:merged base:${RELEASE_BASE_BRANCH} author:${login}`
  const items = await octokit.paginate('GET /search/issues', {
    q,
    sort: 'created',
    order: 'asc',
    per_page: 1
  })

  const first = items[0]?.number ?? null
  firstContributionAuthorCache.set(login, first)
  return first
}

async function isFirstContribution(
  login: string | undefined,
  currentNumber: number
): Promise<boolean> {
  if (!login) return false
  if (login.toLowerCase().endsWith('[bot]')) return false

  const firstNumber = await getFirstMergedPrNumberForAuthor(login)
  return firstNumber === currentNumber
}

async function main(): Promise<void> {
  const prevTag = getPreviousTag(RELEASE_TAG)
  const until = getTagDate(RELEASE_TAG)
  const since = prevTag ? getTagDate(prevTag) : null

  const prNumbers = await queryMergedPullRequestNumbers(since, until)
  const entries: ReleaseEntry[] = []

  for (const number of prNumbers) {
    const pr = await getPullRequest(number)
    if (!pr.data.merged_at) continue

    const parsedBase = parseCategoryAndTitle(pr.data.title)
    const parsed = hasDependenciesLabel(pr.data.labels)
      ? { ...parsedBase, category: DEPENDENCIES_CATEGORY_LABEL }
      : parsedBase
    const outline = extractOutlineSummary(pr.data.body)
    const authorLogin = pr.data.user?.login
    const firstContribution = await isFirstContribution(
      authorLogin,
      pr.data.number
    )
    const summary = outline || parsed.summary

    entries.push({
      number: pr.data.number,
      category: parsed.category,
      summary,
      authorLogin: authorLogin || 'unknown',
      isExternal: isExternalContribution(pr.data.author_association),
      firstContribution,
      mergedAt: pr.data.merged_at
    })
  }

  entries.sort(
    (a, b) => new Date(a.mergedAt).getTime() - new Date(b.mergedAt).getTime()
  )

  const grouped = new Map<CategoryLabel | string, ReleaseEntry[]>()
  for (const entry of entries) {
    const bucket = grouped.get(entry.category) || []
    bucket.push(entry)
    grouped.set(entry.category, bucket)
  }

  const orderedCategories: Array<CategoryLabel | string> =
    CATEGORY_ORDER.filter(category => grouped.has(category))
  for (const category of grouped.keys()) {
    if (!CATEGORY_ORDER.includes(category as CategoryLabel)) {
      orderedCategories.push(category)
    }
  }

  const lines: string[] = []
  lines.push(
    `## :traq.large: traQ_S-UI [\`${RELEASE_TAG}\`](https://github.com/${REPO_FULL}/releases/tag/${RELEASE_TAG}) リリースのお知らせ`
  )
  lines.push('')

  if (entries.length === 0) {
    lines.push('### その他')
    lines.push('- リリース対象の PR が見つかりませんでした')
  } else {
    for (const category of orderedCategories) {
      const items = grouped.get(category) || []
      if (items.length === 0) continue
      lines.push(`### ${category}`)
      lines.push('')
      for (const item of items) {
        let line = `- [#${item.number}](//github.com/${REPO_FULL}/pull/${item.number}) ${item.summary} by ${formatMention(item.authorLogin)}`
        if (item.isExternal) {
          line += ' [external]'
        }
        if (item.firstContribution) {
          line += ' **First contribution** :tada:'
        }
        lines.push(line)
      }
      lines.push('')
    }

    const firstContributors = Array.from(
      new Map(
        entries
          .filter(entry => entry.firstContribution && entry.authorLogin)
          .map(entry => [entry.authorLogin, formatMention(entry.authorLogin)])
      ).values()
    )

    if (firstContributors.length > 0) {
      lines.push('#### New Contributors :tada:')
      lines.push('')
      for (const mention of firstContributors) {
        lines.push(`- ${mention}`)
      }
      lines.push('')
    }
  }

  fs.writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`, 'utf8')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
