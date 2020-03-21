import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/channels/:channel(.*)',
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/users/:user',
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/messages/:message',
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes as RouteConfig[]
})

export default router
