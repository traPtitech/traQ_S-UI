import {
  mimeToFileType,
  isImage,
  isAudio,
  isVideo,
  isNonPreviewable,
  prettifyFileSize
} from '/@/lib/basic/file'
import { ThumbnailType } from '@traptitech/traq'

describe('mimeToFileType', () => {
  it('can get filetype (1)', () => {
    expect(mimeToFileType('image/png')).toEqual('image')
  })
  it('can get filetype (2)', () => {
    expect(mimeToFileType('audio/mpeg')).toEqual('audio')
  })
  it('can get filetype (3)', () => {
    expect(mimeToFileType('video/webm')).toEqual('video')
  })
  it('can get filetype (4)', () => {
    expect(mimeToFileType('text/plain')).toEqual('file')
  })
  it('can get filetype (5)', () => {
    expect(mimeToFileType('')).toEqual('file')
  })
  it('can get filetype (6)', () => {
    expect(mimeToFileType('application/pdf')).toEqual('pdf')
  })
  it('can get filetype (7)', () => {
    expect(mimeToFileType('application/vnd.ms-powerpoint')).toEqual('slide')
  })
  it('can get filetype (8)', () => {
    expect(mimeToFileType('application/vnd.sun.xml.impress')).toEqual('slide')
  })
})

describe('isFileType', () => {
  it('can get filetype (1)', () => {
    expect(isImage('image/png')).toEqual(true)
  })
  it('can get filetype (2)', () => {
    expect(isAudio('audio/mpeg')).toEqual(true)
  })
  it('can get filetype (3)', () => {
    expect(isVideo('video/webm')).toEqual(true)
  })
  it('can get filetype (4)', () => {
    expect(isImage('text/plain')).toEqual(false)
  })
  it('can get filetype (5)', () => {
    expect(isAudio('text/plain')).toEqual(false)
  })
  it('can get filetype (5)', () => {
    expect(isVideo('text/plain')).toEqual(false)
  })
})

describe('isNonPreviewable', () => {
  it('can detect file (1)', () => {
    expect(isNonPreviewable({ mime: 'text/plain', thumbnails: [] })).toEqual(
      true
    )
  })
  it('can detect file (2)', () => {
    expect(
      isNonPreviewable({ mime: 'application/pdf', thumbnails: [] })
    ).toEqual(true)
  })
  it('can detect file (3)', () => {
    expect(
      isNonPreviewable({
        mime: 'application/vnd.ms-powerpoint',
        thumbnails: []
      })
    ).toEqual(true)
  })

  it('can detect image file (not svg) (1)', () => {
    expect(
      isNonPreviewable({
        mime: 'image/webp',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toEqual(false)
  })
  it('can detect image file (not svg) (2)', () => {
    expect(isNonPreviewable({ mime: 'image/webp', thumbnails: [] })).toEqual(
      true
    )
  })
  it('can detect svg file (1)', () => {
    expect(
      isNonPreviewable({
        mime: 'image/svg+xml',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toEqual(false)
  })
  it('can detect svg file (2)', () => {
    expect(isNonPreviewable({ mime: 'image/svg+xml', thumbnails: [] })).toEqual(
      false
    )
  })

  it('can detect audio file (1)', () => {
    expect(isNonPreviewable({ mime: 'audio/mpeg', thumbnails: [] })).toEqual(
      false
    )
  })
  it('can detect audio file (2)', () => {
    expect(
      isNonPreviewable({
        mime: 'audio/mpeg',
        thumbnails: [{ type: ThumbnailType.Waveform, mime: 'image/svg+xml' }]
      })
    ).toEqual(false)
  })

  it('can detect video file (1)', () => {
    expect(isNonPreviewable({ mime: 'video/webm', thumbnails: [] })).toEqual(
      false
    )
  })
  it('can detect video file (2)', () => {
    expect(
      isNonPreviewable({
        mime: 'video/webm',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toEqual(false)
  })
})

describe('prettifyFileSize', () => {
  it('can prettify bytes', () => {
    expect(prettifyFileSize(12)).toEqual('12B')
  })
  it('can prettify kilobytes', () => {
    expect(prettifyFileSize(38240)).toEqual('38.24KB')
  })
  it('can prettify megabytes', () => {
    expect(prettifyFileSize(243950232)).toEqual('243.95MB')
  })
  it('can prettify megabytes', () => {
    expect(prettifyFileSize(24395023423)).toEqual('24.4GB')
  })
})
