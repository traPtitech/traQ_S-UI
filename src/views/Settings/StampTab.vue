<template>
  <section>
    <new-stamp />
    <edit-stamp />
    <div :class="$style.element">
      <h3 :class="$style.header">スタンプパレット</h3>
      <p title="4/1には実装されるよ" :class="$style.content">実装予定</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NewStamp from '/@/components/Settings/StampTab/NewStamp.vue'
import EditStamp from '/@/components/Settings/StampTab/EditStamp.vue'
import store from '/@/vuex'

export default defineComponent({
  name: 'StampTab',
  components: {
    NewStamp,
    EditStamp
  },
  setup() {
    store.dispatch.entities.fetchStamps()
    store.dispatch.entities.fetchStampPalettes()
    // 所有者変更に必要
    store.dispatch.entities.fetchUsers()
    return {}
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
