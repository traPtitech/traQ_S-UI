<template>
  <section>
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
      <form-input v-model="state.displayName" />
    </div>
    <div>
      <h3>ひとこと</h3>
      <form-input v-model="state.bio" />
    </div>
    <div>
      <h3>ホームチャンネル</h3>
      <form-selector v-model="homeChannelState" :options="channelOptions" />
    </div>
    <div>
      <h3>Twitter</h3>
      <form-input v-model="state.twitterId" prefix="@" />
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
import useChannelPath from '@/use/channelPath'
import FormInput from '@/components/UI/FormInput.vue'
import FormSelector from '@/components/UI/FormSelector.vue'

export default defineComponent({
  name: 'ProfileTab',
  setup() {
    const detail = computed(() => store.state.domain.me.detail!)

    const { channelIdToPath } = useChannelPath()
    const channelOptions = computed(() =>
      [
        {
          key: '--未設定--',
          value: '00000000-0000-0000-0000-000000000000'
        }
      ].concat(
        Object.values(store.state.entities.channels)
          .map(channel => ({
            key: `#${channelIdToPath(channel.id).join('/')}`,
            value: channel.id
          }))
          .sort((a, b) => (a.key > b.key ? 1 : -1))
      )
    )

    const state = reactive({
      displayName: detail.value.displayName,
      bio: detail.value.bio,
      twitterId: detail.value.twitterId
    })
    const homeChannelState = ref(
      detail.value.homeChannel ?? '00000000-0000-0000-0000-000000000000'
    )
    const isHomeChannelChanged = computed(
      () =>
        homeChannelState.value !== detail.value.homeChannel &&
        !(
          homeChannelState.value === '00000000-0000-0000-0000-000000000000' &&
          detail.value.homeChannel === null
        )
    )

    const { hasDiff } = useStateDiff<UserDetail>()
    const isStateChanged = computed(
      () => hasDiff(state, detail) || isHomeChannelChanged.value
    )

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
      channelOptions,
      state,
      homeChannelState,
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
    ImageUpload,
    FormInput,
    FormSelector
  }
})
</script>

<style lang="scss" module></style>
