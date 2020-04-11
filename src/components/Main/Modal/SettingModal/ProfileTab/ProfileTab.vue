<template>
  <section :class="$style.container">
    <div>
      <h3>アイコン</h3>
      <user-icon :user-id="detail.id" :size="100" :prevent-modal="true" />
      <image-upload
        @input="onImgSet"
        :destroy-flag="destroyFlag"
        @destroyed="onDestroyed"
        rounded
      />
    </div>
    <div>
      <h3>表示名</h3>
      <input type="text" v-model="state.displayName" />
    </div>
    <div>
      <h3>ひとこと</h3>
      <input type="text" v-model="state.bio" />
    </div>
    <div>
      <h3>Twitter</h3>
      <div :class="$style.twitterInput">
        <input type="text" v-model="state.twitterId" />
      </div>
    </div>
    <p>
      パスワードの変更は
      <a href="https://portal.trap.jp/" target="_blank">
        traPortal
      </a>
      から可能です
    </p>
    <button v-if="isChanged" @click="onUpdateClick">更新</button>
  </section>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  reactive,
  Ref,
  ref
} from '@vue/composition-api'
import store from '@/store'
import { UserDetail } from '@traptitech/traq'
import apis from '@/lib/api'
import useStateDiff from '../use/stateDiff'
import UserIcon from '@/components/UI/UserIcon.vue'
import ImageUpload from '../ImageUpload.vue'

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail!)

    const state = reactive({
      displayName: detail.value.displayName ?? '',
      bio: detail.value.bio ?? '',
      twitterId: detail.value.twitterId ?? ''
    })
    const { hasDiff } = useStateDiff<UserDetail>()
    const isStateChanged = computed(() => hasDiff(state, detail))

    const imgData = ref<Blob>()
    const onImgSet = (file: Blob) => {
      imgData.value = file
    }

    const destroyFlag = ref(false)
    const onDestroyed = () => {
      destroyFlag.value = false
    }

    const isChanged = computed(
      () => isStateChanged.value || imgData.value !== undefined
    )
    const onUpdateClick = async () => {
      const promises = []
      if (imgData.value !== undefined) {
        promises.push(apis.changeUserIcon(detail.value.id, imgData.value))
      }
      if (isStateChanged.value) {
        promises.push(apis.editMe(state))
      }
      try {
        // TODO: loading
        await Promise.all(promises)
        imgData.value = undefined
        destroyFlag.value = true
      } catch (e) {
        // TODO: error
      }
    }

    return {
      detail,
      state,
      isStateChanged,
      onImgSet,
      destroyFlag,
      onDestroyed,
      isChanged,
      onUpdateClick
    }
  },
  components: {
    UserIcon,
    ImageUpload
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}

.twitterInput {
  &::before {
    content: '@';
  }
}
</style>
