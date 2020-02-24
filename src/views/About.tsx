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
      count: computed(() => store.state.entities)
    })
    return () => (
      <div class="about">
        <h1>This is an about page</h1>
        <button
          onClick={() =>
            store.commit.entities.setUsers({
              aaa: {
                id: 'poyo'
              }
            })
          }
        >
          setUsers
        </button>
        <button
          onClick={() =>
            store.commit.entities.setChannels({
              aaa: {
                id: 'poyo'
              }
            })
          }
        >
          setChannels
        </button>
      </div>
    )
  }
})
