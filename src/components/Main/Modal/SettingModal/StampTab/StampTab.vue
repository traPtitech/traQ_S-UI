<template>
  <section>
    <div>
      <h3>スタンプ新規登録</h3>
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="imageUploadState.destroyFlag"
        @destroyed="onNewDestroyed"
      />
      <form-input
        v-model="newStampName"
        label="スタンプ名"
        prefix=":"
        suffix=":"
      />
      <form-button label="新規登録" @click="createStamp" />
    </div>
    <div>
      <h3>スタンプ編集</h3>
      <p>スタンプ選択できる何か</p>
      <div>
        <stamp
          v-for="stamp in myStamps"
          :key="stamp.id"
          :stamp="stamp"
          :is-selected="stamp.id === selectedStampId"
          @click.native="selectStamp(stamp.id)"
        />
      </div>
    </div>
    <div>
      <h3>スタンプパレット</h3>
      <p title="4/1には実装されるよ">実装予定</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from '@vue/composition-api'
import apis from '@/lib/api'
import ImageUpload from '../ImageUpload.vue'
import store from '@/store'
import Stamp from './Stamp.vue'
import FormInput from '@/components/UI/FormInput.vue'
import FormButton from '@/components/UI/FormButton.vue'
import { StampId } from '@/types/entity-ids'
import useImageUpload from '../use/imageUpload'

export default defineComponent({
  name: 'StampTab',
  setup() {
    const {
      imageUploadState,
      destroyImageUploadState,
      onNewImgSet,
      onNewDestroyed
    } = useImageUpload()

    const newStampName = ref('')

    const createStamp = async () => {
      try {
        // TODO: loading
        await apis.createStamp(newStampName.value, imageUploadState.imgData)
        newStampName.value = ''
        destroyImageUploadState()
      } catch (e) {
        // TODO: error
      }
    }

    // TODO: 管理者なら全部変えられるたぶん
    const myUserId = computed(() => store.state.domain.me.detail!.id)
    const myStamps = computed(() =>
      Object.values(store.state.entities.stamps).filter(
        stamp => stamp.creatorId === myUserId.value
      )
    )

    const selectedStampId = ref<StampId>()
    const selectStamp = (id: StampId) => {
      selectedStampId.value = id
    }

    return {
      onNewImgSet,
      imageUploadState,
      onNewDestroyed,
      newStampName,
      createStamp,
      myStamps,
      selectedStampId,
      selectStamp
    }
  },
  components: {
    FormInput,
    FormButton,
    ImageUpload,
    Stamp
  }
})
</script>

<style lang="scss" module></style>
