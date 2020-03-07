<template>
  <div class="home">
    <Navigation></Navigation>
    <MainViewController></MainViewController>
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'
import MainViewController from '@/components/Main/MainView/MainViewController.vue'
import Navigation from '@/components/Main/Navigation/Navigation.vue'

export default createComponent({
  name: 'Home',
  components: {
    MainViewController,
    Navigation
  },
  setup() {
    return {}
  }
})
</script>
