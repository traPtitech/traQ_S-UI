import { useRoute } from 'vue-router'
import { getFirstQuery } from '/@/lib/basic/url'
import { computed } from 'vue'

export const useMessageQuery = () => {
  const route = useRoute()
  return computed(() => getFirstQuery(route.query['message']) ?? undefined)
}
