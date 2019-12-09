import { createComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'

export default createComponent({
  name: 'About',
  setup() {
    const data = reactive({
      count: computed(() => store.getters.module1.count)
    })
    return () => (
      <div class="about">
        <div onClick={() => store.dispatch.module1.testAction({ num: 10 })}>
          {data.count}
        </div>
        <h1>This is an about page</h1>
      </div>
    )
  }
})
