import { mount } from '@vue/test-utils'

import LastOnline from '/@/components/Modal/UserModal/ProfileTab/LastOnline.vue'
import { getFullDayWithTimeString } from '/@/lib/basic/date'

describe('LastOnline', () => {
  it('shows the server timestamp while offline', () => {
    const lastOnline = new Date('2026-09-04T00:00:00Z')
    const wrapper = mount(LastOnline, {
      props: {
        lastOnline: lastOnline.toISOString()
      }
    })

    expect(wrapper.text()).toContain(getFullDayWithTimeString(lastOnline))
  })

  it('shows online status without requiring a timestamp', () => {
    const wrapper = mount(LastOnline, { props: { isOnline: true } })

    expect(wrapper.get('p').text()).toBe('オンライン中')
  })
})
