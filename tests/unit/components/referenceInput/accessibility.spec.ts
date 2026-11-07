import { nextTick } from 'vue'

import { useGroupsStore } from '/@/store/entities/groups'

import {
  focus,
  installReferenceInputFixture,
  lastValue,
  makeInput,
  press
} from './fixture'

await vi.hoisted(async () => {
  await import('./mocks')
})

installReferenceInputFixture()

it('connects a search combobox to its active candidate and announces entity kinds', async () => {
  useGroupsStore().userGroupsMap.value.set('group-id', {
    id: 'group-id',
    name: 'alice',
    description: '',
    icon: '',
    type: '',
    members: [],
    admins: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  })

  const wrapper = await makeInput({ mode: 'search', suggestions: 'real' })
  await focus(wrapper)
  wrapper.vm.insertText('from:al')
  await nextTick()
  const input = wrapper.get('[role="combobox"]')
  expect(input.attributes('aria-expanded')).toBe('true')
  expect(input.attributes('aria-controls')).toBe(
    wrapper.get('[role="grid"]').attributes('id')
  )

  const active = () =>
    wrapper.get(`[id="${input.attributes('aria-activedescendant')}"]`)
  expect(active().attributes('aria-selected')).toBe('true')
  const firstAnnouncement = wrapper.get('[aria-live="polite"]').text()
  press(wrapper, 'ArrowDown')
  await nextTick()
  expect(active().attributes('aria-selected')).toBe('true')
  expect(wrapper.get('[aria-live="polite"]').text()).not.toBe(firstAnnouncement)
  press(wrapper, 'Escape')
  await nextTick()
  expect(input.attributes('aria-expanded')).toBe('false')
  expect(input.attributes('aria-activedescendant')).toBeUndefined()
})

it.each(['ctrlKey', 'metaKey', 'altKey', 'shiftKey'] as const)(
  'leaves %s + ArrowDown to the editor',
  async modifier => {
    const wrapper = await makeInput({ suggestions: 'real' })
    await focus(wrapper)
    wrapper.vm.insertText('@al')
    await nextTick()
    press(wrapper, 'ArrowDown', { [modifier]: true })
    expect(lastValue(wrapper)).toBe('@al')
  }
)
