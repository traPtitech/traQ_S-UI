<template>
  <section :class="$style.container">
    <div>
      <h3>スタンプ新規登録</h3>
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="newDestroyFlag"
        @destroyed="onNewDestroyed"
      />
      <label>
        スタンプ名
        <div :class="$style.stampNameInput">
          <input type="text" v-model="newStampName" />
        </div>
      </label>
      <button @click="createStamp">新規登録</button>
    </div>
    <div>
      <h3>スタンプ編集</h3>
      <p>スタンプ選択できる何か</p>
      <div v-for="stamp in myStamps" :key="stamp.id">
        <stamp :stamp="stamp" />
      </div>
      <image-upload
        @input="onNewImgSet"
        :destroy-flag="newDestroyFlag"
        @destroyed="onNewDestroyed"
      />
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

export default defineComponent({
  name: 'StampTab',
  setup() {
    const newImgData = ref<Blob>()
    const onNewImgSet = (file: Blob) => {
      newImgData.value = file
    }

    const newDestroyFlag = ref(false)
    const onNewDestroyed = () => {
      newDestroyFlag.value = false
    }

    const newStampName = ref('')

    const createStamp = async () => {
      try {
        // TODO: loading
        await apis.createStamp(newStampName.value, newImgData.value)
        newImgData.value = undefined
        newStampName.value = ''
        newDestroyFlag.value = true
      } catch (e) {
        // TODO: error
      }
    }

    const myUserId = computed(() => store.state.domain.me.detail!.id)
    const myStamps = computed(() =>
      Object.values(store.state.entities.stamps).filter(
        stamp => stamp.creatorId === myUserId.value
      )
    )

    return {
      onNewImgSet,
      newDestroyFlag,
      onNewDestroyed,
      newStampName,
      createStamp,
      myStamps
    }
  },
  components: {
    ImageUpload,
    Stamp
  }
})
</script>

<style lang="scss" module>
.container {
  padding: 8px 16px;
  overflow: hidden;
}

.stampNameInput {
  &::before {
    content: ':';
  }
  &::after {
    content: ':';
  }
}
</style>
