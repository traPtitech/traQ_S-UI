<template>
  <div :class="$style.container">
    <share-target :title="title" :text="text" :url="url" />
    <stamp-picker-container />
    <toast-container />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from '@vue/composition-api'
import { getStringParam } from '@/lib/util/params'
import ShareTarget from '@/components/ShareTarget/ShareTarget.vue'
import StampPickerContainer from '@/components/Main/StampPicker/StampPickerContainer.vue'
import ToastContainer from '@/components/Main/Toast/ToastContainer.vue'
import { RouteName } from '@/router'
import store from '@/store'

export default defineComponent({
  name: 'Share',
  components: {
    ShareTarget,
    StampPickerContainer,
    ToastContainer
  },
  setup(props, context) {
    const query = computed(() => context.root.$route.query)
    const title = computed(() => getStringParam(query.value.title))
    const text = computed(() => getStringParam(query.value.text))
    const url = computed(() => getStringParam(query.value.url))

    const show = ref(false)

    onMounted(async () => {
      let isLoggedIn = false
      try {
        await store.dispatch.domain.me.fetchMe()
        isLoggedIn = true
      } catch {}

      if (isLoggedIn) {
        show.value = true
        return
      }

      // シェア画面に入る前にログインさせる
      // ログインしたら戻ってくる
      context.root.$router.replace({
        name: RouteName.Login,
        query: { redirect: `${location.pathname}${location.search}` }
      })
    })

    return { title, text, url }
  }
})
</script>

<style lang="scss" module>
.container {
  @include background-secondary;
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: auto;
  padding: 48px 24px;
}
</style>
