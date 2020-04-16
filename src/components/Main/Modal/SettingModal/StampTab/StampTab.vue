<template>
  <section>
    <new-stamp />
    <edit-stamp />
    <div>
      <h3>スタンプパレット</h3>
      <p title="4/1には実装されるよ">実装予定</p>
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

<style lang="scss" module></style>
