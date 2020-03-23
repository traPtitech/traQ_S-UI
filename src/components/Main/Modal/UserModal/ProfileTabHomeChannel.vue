<template>
  <section :class="$style.homeChannel">
    <h2>ホームチャンネル</h2>
    <p>
      <icon name="home" :mdi="true" />
      <span>#gps/times/{{ props.name }}</span>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Icon from '@/components/UI/Icon.vue'

interface Props {
  name: string
}

export default defineComponent({
  name: 'ProfileTabHomeChannel',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props: Props) {
    return {
      props
    }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.homeChannel {
}
</style>
