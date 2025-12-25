import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { getFirstQuery } from '/@/lib/basic/url'

export const useMessageQuery = () => {
  const route = useRoute()
  return computed(() => getFirstQuery(route.query['message']) ?? undefined)
}
