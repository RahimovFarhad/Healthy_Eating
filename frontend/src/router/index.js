import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, tryRefresh } from '../auth.js'

import HomeView      from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import FoodDiaryView from '../views/FoodDiaryView.vue'
import NutritionView from '../views/NutritionView.vue'
import RecipesView   from '../views/RecipesView.vue'
import GoalsView     from '../views/GoalsView.vue'
import MessagesView  from '../views/MessagesView.vue'
import ProfileView   from '../views/ProfileView.vue'

const routes = [
  { path: '/',          component: HomeView      },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/diary',     component: FoodDiaryView, meta: { requiresAuth: true } },
  { path: '/nutrition', component: NutritionView, meta: { requiresAuth: true } },
  { path: '/recipes',   component: RecipesView,   meta: { requiresAuth: true } },
  { path: '/goals',     component: GoalsView,     meta: { requiresAuth: true } },
  { path: '/messages',  component: MessagesView,  meta: { requiresAuth: true } },
  { path: '/profile',   component: ProfileView,   meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

let initialRefreshDone = false

router.beforeEach(async (to) => {
  if (!initialRefreshDone) {
    initialRefreshDone = true
    if (!isAuthenticated.value) {
      await tryRefresh()
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/', hash: '#auth-section' }
  }
})

export default router
