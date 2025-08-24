import type {
  Entity,
  ReplaceGetters
} from '/@/lib/markdown/internalLinkEmbedder'
import { replace } from '/@/lib/markdown/internalLinkEmbedder'

const users = {
  'dfdff0c9-5de0-46ee-9721-2525e8bb3d44': {
    name: 'a',
    id: 'dfdff0c9-5de0-46ee-9721-2525e8bb3d44'
  },
  'dfdff0c9-5de0-46ee-9721-2525e8bb3d45': {
    name: 'takashi_trap',
    id: 'dfdff0c9-5de0-46ee-9721-2525e8bb3d45'
  },
  'dfdff0c9-5de0-46ee-9721-2525e8bb3d46': {
    name: 'takashi_trape',
    id: 'dfdff0c9-5de0-46ee-9721-2525e8bb3d46'
  },
  'dfdff0c9-5de0-46ee-9721-2525e8bb3d47': {
    name: 'very_long_long_long_long_lo_name',
    id: 'dfdff0c9-5de0-46ee-9721-2525e8bb3d47'
  },
  'dfdff0c9-5de0-46ee-9721-2525e8bb3d48': {
    name: 'trap',
    id: 'dfdff0c9-5de0-46ee-9721-2525e8bb3d48'
  }
}
const groups = {
  'dfabf0c9-5de0-46ee-9721-2525e8bb3d45': {
    name: 'okあok',
    id: 'dfabf0c9-5de0-46ee-9721-2525e8bb3d45'
  },
  'dfabf0c9-5de0-46ee-9721-2525e8bb3d46': {
    name: 'takashi_trapo',
    id: 'dfabf0c9-5de0-46ee-9721-2525e8bb3d46'
  }
}
const channels = {
  'ea452867-553b-4808-a14f-a47ee0009ee6': {
    name: 'a',
    id: 'ea452867-553b-4808-a14f-a47ee0009ee6'
  }
}

interface EntityWithName extends Entity {
  name: string
}

const createFindFunc =
  (store: Record<string, EntityWithName>) =>
  (name: string): EntityWithName | undefined =>
    Object.values(store).find(e => e.name.toLowerCase() === name.toLowerCase())

const testStore: ReplaceGetters = {
  getUser: createFindFunc(users),
  getGroup: createFindFunc(groups),
  getChannel: createFindFunc(channels)
}

/**
 * 置換前, 置換後
 */
type Spec = [string, string]

const specs: Spec[] = [
  // must embed cases
  [
    'aaaa#aeee `#a` @takashi_trapa @takashi_trap @#a\n```\n#a @takashi_trap\n```\n@okあok',
    'aaaa#aeee `#a` @takashi_trapa !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"} @!{"type":"channel","raw":"#a","id":"ea452867-553b-4808-a14f-a47ee0009ee6"}\n```\n#a @takashi_trap\n```\n!{"type":"group","raw":"@okあok","id":"dfabf0c9-5de0-46ee-9721-2525e8bb3d45"}'
  ],
  ['$$\\text{@takashi_trap}$$', '$$\\text{@takashi_trap}$$'],
  ['$$\n```\n@takashi_trap\n```\n$$', '$$\n```\n@takashi_trap\n```\n$$'],
  [
    '`$@takashi_trap$` @takashi_trap @very_long_long_long_long_lo_name',
    '`$@takashi_trap$` !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"} !{"type":"user","raw":"@very_long_long_long_long_lo_name","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d47"}'
  ],
  [
    '`@takashi_trap` $@takashi_trap$ $$ $ `$@takashi_trap$$@takashi_trap$`$@takashi_trap$`$`',
    '`@takashi_trap` $@takashi_trap$ $$ $ `$@takashi_trap$$@takashi_trap$`$@takashi_trap$`$`'
  ],
  [
    '`$@takashi_trap$` $@takashi_trap$ `@takashi_trap`',
    '`$@takashi_trap$` $@takashi_trap$ `@takashi_trap`'
  ],
  ['`okあok`', '`okあok`'],
  ['$okあok$', '$okあok$'],
  ['`$okあok$`', '`$okあok$`'],
  [
    '````\n```\n@takashi_trap\n```\n````\n\n```\n@takashi_trap\n```',
    '````\n```\n@takashi_trap\n```\n````\n\n```\n@takashi_trap\n```'
  ],
  [
    '@takashi_trapああ a@takashi_trap',
    '!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}ああ a!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}'
  ],
  [
    ':@takashi_trap:ああ a@takashi_trap',
    ':@takashi_trap:ああ a!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}'
  ],
  [
    '@takashi_trapああ:',
    '!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}ああ:'
  ],
  [
    '@takashi_trap:@takashi_trap: :@takashi_trap: :takashi_trap',
    '!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}:@takashi_trap: :@takashi_trap: :takashi_trap'
  ],
  [
    '@takashi_trapo @takashi_trape',
    '!{"type":"group","raw":"@takashi_trapo","id":"dfabf0c9-5de0-46ee-9721-2525e8bb3d46"} !{"type":"user","raw":"@takashi_trape","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d46"}'
  ],
  [
    '@)、(@takashi_trap @takashi_trap)',
    '@)、(!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"} !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"})'
  ],
  [
    '@a',
    '!{"type":"user","raw":"@a","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d44"}'
  ],
  // must not embed cases
  ['https://example.com#a', 'https://example.com#a'],
  ['example.com/#a', 'example.com/#a'],
  ['example.com/hello#a', 'example.com/hello#a'],
  ['https://example.com/@takashi_trap', 'https://example.com/@takashi_trap'],
  [
    'example.com/users/@takashi_trap/hello',
    'example.com/users/@takashi_trap/hello'
  ],
  ['info@trap.jp', 'info@trap.jp'],
  ['@ab', '@ab']
]

describe('internalLinkEmbedder', () => {
  specs.forEach(([before, after], i) => {
    it(`must or must not embed internal links ${i}`, () => {
      expect(replace(before, testStore)).toEqual(after)
    })
  })
})
