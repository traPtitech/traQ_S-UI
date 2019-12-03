import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueCompositionAPI from '@vue/composition-api'
import HelloWorld from '@/components/HelloWorld'

const localVue = createLocalVue()
localVue.use(VueCompositionAPI)

describe('HelloWorld', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      localVue,
      propsData: { msg }
    })
    // TODO: https://github.com/vuejs/composition-api/issues/151
    // expect(wrapper.text()).toMatch(msg)
  })
})
