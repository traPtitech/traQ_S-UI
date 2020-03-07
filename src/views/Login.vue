<template>
  <div class="login">
    <div>
      <span>name</span>
      <input v-model="loginState.name" />
    </div>
    <div>
      <span>pass</span>
      <input v-model="loginState.pass" />
    </div>
    <button @click="login">login</button>
    <button @click="logout">logout</button>
    <button @click="fetchUsers">
      fetchUsers
    </button>
    <button @click="fetchChannels">
      fetchChannels
    </button>
    <div>store.state.entities.users:</div>
    <pre>{{ JSON.stringify(state.users, null, 4) }}</pre>
    <div>store.state.entities.channels:</div>
    <pre>{{ JSON.stringify(state.channels, null, 4) }}</pre>
  </div>
</template>

<script lang="ts">
import { createComponent, reactive, computed } from '@vue/composition-api'
import store from '@/store'
import api from '@/lib/api'

const useLogin = () => {
  const loginState = reactive({
    name: '',
    pass: ''
  })
  const login = () =>
    api.login({ name: loginState.name, pass: loginState.pass })
  const logout = () => api.logout()
  return {
    loginState,
    login,
    logout
  }
}

export default createComponent({
  name: 'Login',
  setup() {
    const { loginState, login, logout } = useLogin()
    const fetchUsers = () => store.dispatch.entities.fetchUsers()
    const fetchChannels = () => store.dispatch.entities.fetchChannels()

    const state = reactive({
      users: computed(() => store.state.entities.users),
      channels: computed(() => store.state.entities.channels)
    })

    return {
      loginState,
      login,
      logout,
      fetchUsers,
      fetchChannels,
      state
    }
  }
})
</script>
