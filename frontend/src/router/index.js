// router/index.js — Vue Router configuration
// Each route maps a URL path to a view component.
// createWebHistory() uses the browser's History API (clean URLs, no # hash).

import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../auth.js'

// Import every view (page) component
import HomeView      from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import FoodDiaryView from '../views/FoodDiaryView.vue'
import NutritionView from '../views/NutritionView.vue'
import RecipesView   from '../views/RecipesView.vue'
import GoalsView     from '../views/GoalsView.vue'
import MessagesView  from '../views/MessagesView.vue'

// Routes marked `requiresAuth: true` are protected — only accessible when logged in.
const routes = [
  { path: '/',          component: HomeView      },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/diary',     component: FoodDiaryView, meta: { requiresAuth: true } },
  { path: '/nutrition', component: NutritionView, meta: { requiresAuth: true } },
  { path: '/recipes',   component: RecipesView,   meta: { requiresAuth: true } },
  { path: '/goals',     component: GoalsView,     meta: { requiresAuth: true } },
  { path: '/messages',  component: MessagesView,  meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Scroll to top on every navigation, or to a hash anchor if provided
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Navigation guard — runs before every route change.
// If the destination requires auth and the user isn't logged in,
// redirect them to the homepage login section.
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/', hash: '#auth-section' }
  }
})

export default router
