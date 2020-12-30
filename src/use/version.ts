import { readonly, Ref, ref, toRaw, watchEffect } from 'vue'
import apis from '@/lib/apis'
import { Version } from '@traptitech/traq'

const useVersion = (needed: Ref<boolean> | boolean = true) => {
  const version = ref<Version>()

  const fetch = async () => {
    const res = await apis.getServerVersion()
    version.value = res.data
  }
  watchEffect(() => {
    if (toRaw(needed) && !version.value) {
      fetch()
    }
  })

  return readonly(version)
}

export default useVersion
