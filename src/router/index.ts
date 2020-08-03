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

const routes: RouteRecordRaw[] = [
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
    path: '/messages/:id',
    name: RouteName.Message,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/files/:id',
    name: RouteName.File,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/clip-folders/:id',
    name: RouteName.ClipFolders,
    component: () => import(/* webpackChunkname: "Main" */ '@/views/Main.vue')
  },
  {
    path: '/share-target',
    name: RouteName.ShareTarget,
    component: () =>
      import(/* webpackChunkname: "ShareTarget" */ '@/views/ShareTarget.vue')
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
    path: '/consent',
    name: RouteName.Consent,
    component: () => import(/* webpackChunkName: "Auth" */ '@/views/Auth.vue'),
    props: { type: 'consent' }
  },
  {
    path: '/:catchAll(.*)',
    name: RouteName.NotFound,
    component: () =>
      import(/* webpackChunkName: "NotFound" */ '@/views/NotFound.vue')
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
