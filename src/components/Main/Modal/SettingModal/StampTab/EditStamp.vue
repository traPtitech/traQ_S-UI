<template>
  <div>
    <h3>スタンプ編集</h3>
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
</template>

<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'
import { StampId } from '@/types/entity-ids'
import Stamp from './Stamp.vue'

export default defineComponent({
  name: 'EditStamp',
  setup() {
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
      myStamps,
      selectedStampId,
      selectStamp
    }
  },
  components: {
    Stamp
  }
})
</script>

<style lang="scss" module></style>
