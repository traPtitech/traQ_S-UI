<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/login">Login</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api'
import store from './store'

export default createComponent({
  name: 'App',
  components: {},
  setup() {
    return {}
  }
})
</script>
