<template>
  <section>
    <new-stamp />
    <edit-stamp />
    <div :class="$style.element">
      <h3>スタンプパレット</h3>
      <p title="4/1には実装されるよ" :class="$style.content">実装予定</p>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import NewStamp from './NewStamp.vue'
import EditStamp from './EditStamp.vue'

export default defineComponent({
  name: 'StampTab',
  setup() {
    return {}
  },
  components: {
    NewStamp,
    EditStamp
  }
})
</script>

<style lang="scss" module>
h3 {
  margin-bottom: 8px;
}
.element {
  margin: 24px 0;
}
.content {
  margin-left: 12px;
}
</style>
