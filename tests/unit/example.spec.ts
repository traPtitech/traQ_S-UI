import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueCompositionAPI from '@vue/composition-api'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)

describe('HelloWorld', () => {
  it('example', () => {
    // TODO: https://github.com/vuejs/composition-api/issues/151
    // expect(wrapper.text()).toMatch(msg)
  })
})
