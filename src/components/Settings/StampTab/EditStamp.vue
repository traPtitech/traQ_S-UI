<template>
  <div :class="$style.element">
    <h3 :class="$style.header">スタンプ編集</h3>
    <div :class="$style.content">
      <stamp
        v-for="stamp in myStamps"
        :key="stamp.id"
        :stamp="stamp"
        :is-selected="stamp.id === selectedStampId"
        @start-edit="selectStamp(stamp.id)"
        @end-edit="unselectStamp"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import store from '/@/store'
import { StampId } from '/@/types/entity-ids'
import Stamp from './Stamp.vue'

export default defineComponent({
  name: 'EditStamp',
  components: {
    Stamp
  },
  setup() {
    // TODO: 管理者なら全部変えられるたぶん https://github.com/traPtitech/traQ_S-UI/issues/291
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const myUserId = computed(() => store.getters.domain.me.myId!)
    const myStamps = computed(() =>
      [...store.state.entities.stampsMap.values()].filter(
        stamp => stamp.creatorId === myUserId.value
      )
    )

    const selectedStampId = ref<StampId | null>()
    const selectStamp = (id: StampId) => {
      selectedStampId.value = id
    }
    const unselectStamp = () => {
      selectedStampId.value = null
    }
    return {
      myStamps,
      selectedStampId,
      selectStamp,
      unselectStamp
    }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
</style>
