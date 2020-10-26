import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export enum RouteName {
  Index = 'index',
  Channel = 'channel',
  User = 'user',
  Message = 'message',
  File = 'File',
  ClipFolders = 'clip-folders',
  ShareTarget = 'share-target',
  Login = 'login',
  Registration = 'registration',
  ResetPassword = 'reset-password',
  Consent = 'consent',
  NotFound = 'not-found'
}

export const constructChannelPath = (channel: string) => `/channels/${channel}`
export const constructUserPath = (name: string) => `/users/${name}`
export const constructClipFoldersPath = (id: string) => `/clip-folders/${id}`

export const changeRouteByPath = (path: string) => {
  // 同じ場所に移動しようとした際のエラーを消す
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  router.push(path).catch(() => {})
}

const Main = defineAsyncComponent(
  () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
)
const ShareTarget = defineAsyncComponent(
  () => import(/* webpackChunkname: "ShareTarget" */ '@/views/ShareTarget.vue')
)
const Auth = defineAsyncComponent(
  () => import(/* webpackChunkName: "Auth" */ '@/views/Auth.vue')
)
const NotFound = defineAsyncComponent(
  () => import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
)

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: RouteName.Index,
    component: Main
  },
  {
    path: constructChannelPath(':channel(.*)'),
    name: RouteName.Channel,
    component: Main
  },
  {
    path: '/users/:user',
    name: RouteName.User,
    component: Main
  },
  {
    path: '/messages/:id',
    name: RouteName.Message,
    component: Main
  },
  {
    path: '/files/:id',
    name: RouteName.File,
    component: Main
  },
  {
    path: '/clip-folders/:id',
    name: RouteName.ClipFolders,
    component: Main
  },
  {
    path: '/share-target',
    name: RouteName.ShareTarget,
    component: ShareTarget
  },
  {
    path: '/login',
    name: RouteName.Login,
    component: Auth,
    props: { type: 'login' }
  },
  // {
  //   path: '/registration',
  //   name: RouteName.Registration,
  //   component: Auth,
  //   props: { type: 'registration' }
  // },
  {
    path: '/consent',
    name: RouteName.Consent,
    component: Auth,
    props: { type: 'consent' }
  },
  {
    path: '/:catchAll(.*)',
    name: RouteName.NotFound,
    component: NotFound
  }
]

const routerHistory = createWebHistory(process.env.BASE_URL)

const router = createRouter({
  history: routerHistory,
  routes
})
router.beforeEach((to, from, next) => {
  // trailing slashを消す
  if (to.path !== '/' && to.path.endsWith('/')) {
    next(to.path.slice(0, -1))
  }

  next()
})

export default router
