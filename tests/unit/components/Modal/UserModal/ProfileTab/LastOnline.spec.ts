import { mount } from '@vue/test-utils'

import LastOnline from '/@/components/Modal/UserModal/ProfileTab/LastOnline.vue'
import { getFullDayWithTimeString } from '/@/lib/basic/date'

describe('LastOnline', () => {
  it('shows the last confirmed online timestamp', () => {
    const lastOnline = new Date('2026-09-04T00:00:00Z')
    const wrapper = mount(LastOnline, {
      props: {
        lastOnline: lastOnline.toISOString()
      }
    })

    expect(wrapper.text()).toContain(getFullDayWithTimeString(lastOnline))
  })
})
