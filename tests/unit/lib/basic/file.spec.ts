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
    expect(mimeToFileType('image/png')).toBe('image')
  })
  it('can get filetype (2)', () => {
    expect(mimeToFileType('audio/mpeg')).toBe('audio')
  })
  it('can get filetype (3)', () => {
    expect(mimeToFileType('video/webm')).toBe('video')
  })
  it('can get filetype (4)', () => {
    expect(mimeToFileType('text/plain')).toBe('file')
  })
  it('can get filetype (5)', () => {
    expect(mimeToFileType('')).toBe('file')
  })
  it('can get filetype (6)', () => {
    expect(mimeToFileType('application/pdf')).toBe('pdf')
  })
  it('can get filetype (7)', () => {
    expect(mimeToFileType('application/vnd.ms-powerpoint')).toBe('slide')
  })
  it('can get filetype (8)', () => {
    expect(mimeToFileType('application/vnd.sun.xml.impress')).toBe('slide')
  })
})

describe('isFileType', () => {
  it('can get filetype (1)', () => {
    expect(isImage('image/png')).toBe(true)
  })
  it('can get filetype (2)', () => {
    expect(isAudio('audio/mpeg')).toBe(true)
  })
  it('can get filetype (3)', () => {
    expect(isVideo('video/webm')).toBe(true)
  })
  it('can get filetype (4)', () => {
    expect(isImage('text/plain')).toBe(false)
  })
  it('can get filetype (5)', () => {
    expect(isAudio('text/plain')).toBe(false)
  })
  it('can get filetype (6)', () => {
    expect(isVideo('text/plain')).toBe(false)
  })
})

describe('isNonPreviewable', () => {
  it('can detect file (1)', () => {
    expect(isNonPreviewable({ mime: 'text/plain', thumbnails: [] })).toBe(true)
  })
  it('can detect file (2)', () => {
    expect(isNonPreviewable({ mime: 'application/pdf', thumbnails: [] })).toBe(
      true
    )
  })
  it('can detect file (3)', () => {
    expect(
      isNonPreviewable({
        mime: 'application/vnd.ms-powerpoint',
        thumbnails: []
      })
    ).toBe(true)
  })

  it('can detect image file (not svg) (1)', () => {
    expect(
      isNonPreviewable({
        mime: 'image/webp',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toBe(false)
  })
  it('can detect image file (not svg) (2)', () => {
    expect(isNonPreviewable({ mime: 'image/webp', thumbnails: [] })).toBe(true)
  })
  it('can detect svg file (1)', () => {
    expect(
      isNonPreviewable({
        mime: 'image/svg+xml',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toBe(false)
  })
  it('can detect svg file (2)', () => {
    expect(isNonPreviewable({ mime: 'image/svg+xml', thumbnails: [] })).toBe(
      false
    )
  })

  it('can detect audio file (1)', () => {
    expect(isNonPreviewable({ mime: 'audio/mpeg', thumbnails: [] })).toBe(false)
  })
  it('can detect audio file (2)', () => {
    expect(
      isNonPreviewable({
        mime: 'audio/mpeg',
        thumbnails: [{ type: ThumbnailType.Waveform, mime: 'image/svg+xml' }]
      })
    ).toBe(false)
  })

  it('can detect video file (1)', () => {
    expect(isNonPreviewable({ mime: 'video/webm', thumbnails: [] })).toBe(false)
  })
  it('can detect video file (2)', () => {
    expect(
      isNonPreviewable({
        mime: 'video/webm',
        thumbnails: [{ type: ThumbnailType.Image, mime: 'image/png' }]
      })
    ).toBe(false)
  })
})

describe('prettifyFileSize', () => {
  it('can prettify bytes', () => {
    expect(prettifyFileSize(12)).toBe('12B')
  })
  it('can prettify kilobytes', () => {
    expect(prettifyFileSize(38240)).toBe('38.24KB')
  })
  it('can prettify megabytes', () => {
    expect(prettifyFileSize(243950232)).toBe('243.95MB')
  })
  it('can prettify gigabytes', () => {
    expect(prettifyFileSize(24395023423)).toBe('24.4GB')
  })
})
