import { createComponent, reactive } from '@vue/composition-api'
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
  name: 'About',
  setup() {
    const { loginState, login, logout } = useLogin()
    return () => (
      <div class="login">
        <div>
          <span>name</span>
          <input
            value={loginState.name}
            onChange={event =>
              (loginState.name = event.target.value?.toString() ?? '')
            }></input>
        </div>
        <div>
          <span>pass</span>
          <input
            value={loginState.pass}
            onChange={event =>
              (loginState.pass = event.target.value?.toString() ?? '')
            }
          />
        </div>
        <button onClick={login}>login</button>
        <button onClick={logout}>logout</button>
        <button onClick={() => store.dispatch.entities.fetchUsers()}>
          fetchUsers
        </button>
        <button onClick={() => store.dispatch.entities.fetchChannels()}>
          fetchChannels
        </button>
        <div>store.state.entities.users:</div>
        <pre>{JSON.stringify(store.state.entities.users, null, 4)}</pre>
        <div>store.state.entities.channels:</div>
        <pre>{JSON.stringify(store.state.entities.channels, null, 4)}</pre>
      </div>
    )
  }
})
