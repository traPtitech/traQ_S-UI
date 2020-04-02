import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

export enum RouteName {
  Index = 'index',
  Channel = 'channel',
  User = 'user',
  Message = 'message',
  Login = 'login',
  Registration = 'registration',
  ResetPassword = 'reset-password',
  NotFound = 'not-found'
}

export const constructChannelPath = (channel: string) => `/channels/${channel}`

const routes = [
  {
    path: '/',
    name: RouteName.Index,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: constructChannelPath(':channel(.*)'),
    name: RouteName.Channel,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/users/:user',
    name: RouteName.User,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/messages/:message',
    name: RouteName.Message,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/login',
    name: RouteName.Login,
    component: () => import(/* webpackChunkName: "Auth" */ '@/views/Auth.vue'),
    props: { type: 'login' }
  },
  // {
  //   path: '/registration',
  //   name: RouteName.Registration,
  //   component: () => import(/* webpackChunkName: "Auth" */ '@/views/Auth.vue'),
  //   props: { type: 'registration' }
  // },
  {
    path: '*',
    name: RouteName.NotFound,
    component: () =>
      import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes as RouteConfig[]
})

export default router
