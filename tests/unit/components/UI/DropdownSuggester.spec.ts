import { nextTick } from 'vue'

import { mount } from '@vue/test-utils'

import DropdownSuggester from '/@/components/UI/DropdownSuggester/DropdownSuggester.vue'
import type { Candidate } from '/@/lib/suggestion/types'

const scrollIntoView = vi.fn()
const wrappers: ReturnType<typeof mount<typeof DropdownSuggester>>[] = []

const candidates: Candidate[] = ['alpha', 'beta'].map(name => ({
  word: { type: 'stamp', id: name, text: `:${name}` },
  display: `:${name}:`
}))

const create = async (isShown = true) => {
  const wrapper = mount(DropdownSuggester, {
    props: {
      popupId: 'suggestions',
      isShown,
      width: 280,
      position: { top: 200, left: 100 },
      candidates,
      shortcuts: [],
      showKeyboardHints: false,
      selectedIndex: 0,
      teleport: false
    },
    global: { stubs: { DropdownSuggesterCandidate: true } }
  })
  wrappers.push(wrapper)
  await nextTick()
  return wrapper
}

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  scrollIntoView.mockClear()
})

it('does not scroll back to the selected candidate when the popup position changes', async () => {
  const wrapper = await create()
  expect(scrollIntoView).toHaveBeenCalledOnce()
  scrollIntoView.mockClear()

  await wrapper.setProps({ position: { top: 190, left: 100 } })
  await wrapper.setProps({ showKeyboardHints: true })

  expect(scrollIntoView).not.toHaveBeenCalled()
})

it('scrolls to the selected candidate when opening, navigating, or replacing candidates', async () => {
  const wrapper = await create(false)
  expect(scrollIntoView).not.toHaveBeenCalled()

  await wrapper.setProps({ isShown: true })
  expect(scrollIntoView).toHaveBeenCalledOnce()
  expect(scrollIntoView.mock.contexts.at(-1)).toBe(
    wrapper.get('[aria-selected="true"]').element
  )
  scrollIntoView.mockClear()

  await wrapper.setProps({ selectedIndex: 1 })
  expect(scrollIntoView).toHaveBeenCalledOnce()
  expect(scrollIntoView.mock.contexts.at(-1)).toBe(
    wrapper.findAll('[role="row"]')[1]?.element
  )
  scrollIntoView.mockClear()

  await wrapper.setProps({ candidates: [...candidates].reverse() })
  expect(scrollIntoView).toHaveBeenCalledOnce()
  expect(scrollIntoView.mock.contexts.at(-1)).toBe(
    wrapper.get('[aria-selected="true"]').element
  )
})
