import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
      },
      // {
      //   path: 'articles',
      //   name: 'Articles',
      //   component: () => import('@/views/article/Articles.vue'),
      // },
      // {
      //   path: 'articles/:id',
      //   name: 'ArticleDetail',
      //   component: () => import('@/views/article/ArticleDetail.vue'),
      //   props: true,
      // },
      // {
      //   path: 'photos',
      //   name: 'Photos',
      //   component: () => import('@/views/photo/Photos.vue'),
      // },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/article/CategoriesPage.vue'),
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('@/views/article/TagsPage.vue'),
      },
      // {
      //   path: 'about',
      //   name: 'About',
      //   component: () => import('@/views/about/About.vue'),
      // },
    ],
  },
  {
    path: '/articles',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Articles',
        component: () => import('@/views/article/Articles.vue'),
      },
      {
        path: ':id',
        name: 'ArticleDetail',
        component: () => import('@/views/article/ArticleDetail.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/photos',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Photos',
        component: () => import('@/views/photo/Photos.vue'),
      },
    ],
  },
  {
    path: '/about',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'About',
        component: () => import('@/views/about/About.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 导航守卫
router.beforeEach((to, from) => {
  // const userStore = useUserStore()

  // if (to.meta.requiresAuth && !userStore.isLogin) {
  //   // 需要登录但未登录
  //   next('/login')
  // } else if (to.meta.roles) {
  //   // 检查角色
  //   const hasRequiredRole = to.meta.roles.some(
  //     role => userStore.hasRole(role)
  //   )
  //   if (!hasRequiredRole) {
  //     next('/403')  // 无权限页面
  //   } else {
  //     next()
  //   }
  // } else {
  //   next()
  // }
})

export default router