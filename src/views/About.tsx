import { createComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import { Apis as V2Apis } from 'traq-api-v2'
import { Apis as V3Apis } from 'traq-api-v3'

const v2Apis = new V2Apis({
  basePath: '/api/1.0'
})

const v3Apis = new V3Apis({
  basePath: '/api/v3'
})

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
