import { detectMentionOfMe } from '/@/lib/markdown/detector'

describe('detectMentionOfMe', () => {
  it('can detect empty false', () => {
    expect(detectMentionOfMe(str1, myId, myGroupIds)).toEqual(false)
  })
  it('can detect my user mention', () => {
    expect(detectMentionOfMe(str2, myId, myGroupIds)).toEqual(true)
  })
  it('can detect not my user mention', () => {
    expect(detectMentionOfMe(str3, myId, myGroupIds)).toEqual(false)
  })
  it('can detect my group mention', () => {
    expect(detectMentionOfMe(str4, myId, myGroupIds)).toEqual(true)
  })
  it('can detect not my group mention', () => {
    expect(detectMentionOfMe(str5, myId, myGroupIds)).toEqual(false)
  })
  it('can detect invalid json', () => {
    expect(detectMentionOfMe(str6, myId, myGroupIds)).toEqual(false)
  })
})

const myId = 'e97518db-ebb8-450f-9b4a-273234e68491'
const myGroupIds = [
  'd7461966-e5d3-4c6d-9538-7c8605f45a1e',
  'd7461966-e5d3-4c6d-9538-7c8605f45a1d',
  'd7461966-e5d3-4c6d-9538-7c8605f45a1f'
]

const str1 = ''
const str2 =
  '!{"type":"user","raw":"@me","id":"e97518db-ebb8-450f-9b4a-273234e68491"}'
const str3 =
  '!{"type":"user","raw":"@someone","id":"e97518db-ebb8-450f-9b4a-273234e68591"}'
const str4 =
  '!{"type":"group","raw":"@meAndSomeone","id":"d7461966-e5d3-4c6d-9538-7c8605f45a1d"}'
const str5 =
  '!{"type":"group","raw":"@someonesGroup","id":"d7461966-e5d3-4c6d-9538-7c9605f45a1d"}'
const str6 = '!{invalid:json}'
