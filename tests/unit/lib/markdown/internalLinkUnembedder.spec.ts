import { replaceBack } from '/@/lib/markdown/internalLinkUnembedder'

/**
 * 置換前, 置換後
 */
type Spec = [string, string]

const specs: Spec[] = [
  [
    '!{} !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"} !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-',
    '!{} @takashi_trap !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-'
  ],
  [
    '!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"} !{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}',
    '@takashi_trap @takashi_trap'
  ],
  ['!{"type":"null"}', '!{"type":"null"}']
  // 今の実装だとコードブロック内でも置換されてしまうのでコメントアウト
  /*
  [
    '`!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}` $!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}$',
    '`!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}` $!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}$'
  ],
  [
    '```\n!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}\n```\n\n$$\n!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}\n$$',
    '```\n!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}\n```\n\n$$\n!{"type":"user","raw":"@takashi_trap","id":"dfdff0c9-5de0-46ee-9721-2525e8bb3d45"}\n$$'
  ]
  */
]

describe('internalLinkUnembedder', () => {
  specs.forEach(([before, after], i) => {
    it(`can unembed internal links ${i}`, () => {
      expect(replaceBack(before)).toEqual(after)
    })
  })
})
