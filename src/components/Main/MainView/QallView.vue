<template>
  <div :class="$style.Block">
    <h1 :class="$style.Header">
      Qall View
    </h1>
  </div>
</template>

<script lang="ts">
import { createComponent, SetupContext } from '@vue/composition-api'
import styled from 'vue-styled-components'

export default createComponent({
  name: 'QallView',
  props: {},
  setup() {
    return {}
  }
})
</script>

<style lang="scss" module>
.Block {
  color: green;
}

.Header {
  font: {
    size: 30px;
    weight: bold;
  }
  color: green;
}
</style>
