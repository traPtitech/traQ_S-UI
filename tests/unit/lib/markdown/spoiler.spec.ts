import { toggleSpoiler } from '/@/lib/markdown/spoiler'

describe('toggleSpoiler', () => {
  it('can toggle to shown', () => {
    const $spoiler = document.createElement('span')
    $spoiler.classList.add('spoiler')

    toggleSpoiler($spoiler)

    expect($spoiler.hasAttribute('shown')).toEqual(true)
  })
  it('can toggle to unshown', () => {
    const $spoiler = document.createElement('span')
    $spoiler.classList.add('spoiler')
    $spoiler.setAttribute('shown', '')

    toggleSpoiler($spoiler)

    expect($spoiler.hasAttribute('shown')).toEqual(false)
  })

  it('can toggle parent to shown', () => {
    const $spoiler = document.createElement('span')
    $spoiler.classList.add('spoiler')
    const $child = document.createElement('span')
    $spoiler.appendChild($child)

    toggleSpoiler($child)

    expect($spoiler.hasAttribute('shown')).toEqual(true)
  })
  it('can toggle parent to unshown', () => {
    const $spoiler = document.createElement('span')
    $spoiler.classList.add('spoiler')
    $spoiler.setAttribute('shown', '')
    const $child = document.createElement('span')
    $spoiler.appendChild($child)

    toggleSpoiler($child)

    expect($spoiler.hasAttribute('shown')).toEqual(false)
  })
})
