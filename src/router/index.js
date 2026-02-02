import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '年会抽奖' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { title: '管理员控制面板' },
    children: [
      {
        path: 'participants',
        name: 'Participants',
        component: () => import('../views/Participants.vue'),
        meta: { title: '参与者管理' }
      },
      {
        path: 'awards',
        name: 'Awards',
        component: () => import('../views/Awards.vue'),
        meta: { title: '奖项设置' }
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../views/History.vue'),
        meta: { title: '历史记录' }
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('../views/Groups.vue'),
        meta: { title: '分组概率设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '年会在线大屏抽奖'
  next()
})

export default router