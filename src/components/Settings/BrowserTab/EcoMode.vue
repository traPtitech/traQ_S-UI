<template>
  <div>
    <div :class="$style.eco">
      <h3 :class="$style.header">省エネモード</h3>
      <toggle v-model="value" :class="$style.toggle" />
    </div>
    <div :class="$style.content">
      <p>
        省エネモードがONの場合、スタンプエフェクトのアニメーションを表示しません
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Toggle from '/@/components/UI/Toggle.vue'
import { useModelValueSyncer } from '/@/use/modelSyncer'

export default defineComponent({
  name: 'EcoMode',
  components: {
    Toggle
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const value = useModelValueSyncer(props, emit)
    return { value }
  }
})
</script>

<style lang="scss" module>
.header {
  margin-bottom: 8px;
}
.content {
  margin-left: 12px;
}
.eco {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  h3 {
    margin: 0;
  }
  .toggle {
    margin-left: 12px;
  }
}
</style>
