import { createRouter, createWebHistory } from 'vue-router'
import { h, nextTick } from 'vue'
import { isAuthenticated, currentUser, tryRefresh } from '../auth.js'

import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfessionalDashboardView from '../views/ProfessionalDashboardView.vue'
import FoodDiaryView from '../views/FoodDiaryView.vue'
import NutritionView from '../views/NutritionView.vue'
import RecipesView from '../views/RecipesView.vue'
import GoalsView from '../views/GoalsView.vue'
import MessagesView from '../views/MessagesView.vue'
import ProfileView from '../views/ProfileView.vue'
import MealPlanView from '../views/MealPlanView.vue'
import ProfessionalRegisterView from '../views/ProfessionalRegisterView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import VerifyEmailProfessionalView from '../views/VerifyEmailProfessionalView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const DashboardSwitch = {
  name: 'DashboardSwitch',
  render() {
    return currentUser.value.role === 'professional'
      ? h(ProfessionalDashboardView)
      : h(DashboardView)
  },
}

const routes = [
  { path: '/', component: HomeView, meta: { title: 'Home' } },
  { path: '/register/professional', component: ProfessionalRegisterView, meta: { title: 'Professional Registration' } },
  { path: '/verify-email', component: VerifyEmailView, meta: { title: 'Verify Email' } },
  { path: '/verify-email/professional', component: VerifyEmailProfessionalView, meta: { title: 'Verify Email' } },
  { path: '/dashboard', component: DashboardSwitch, meta: { requiresAuth: true, title: 'Dashboard' } },
  { path: '/diary', component: FoodDiaryView, meta: { requiresAuth: true, subscriberOnly: true, title: 'Food Diary' } },
  { path: '/nutrition', component: NutritionView, meta: { requiresAuth: true, subscriberOnly: true, title: 'Nutrition' } },
  { path: '/recipes/:id?', component: RecipesView, meta: { requiresAuth: true, title: 'Recipes' } },
  { path: '/goals', component: GoalsView, meta: { requiresAuth: true, subscriberOnly: true, title: 'Goals' } },
  { path: '/meal-plans', component: MealPlanView, meta: { requiresAuth: true, subscriberOnly: true, title: 'Meal Plans' } },
  { path: '/messages', component: MessagesView, meta: { requiresAuth: true, title: 'Messages' } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true, title: 'Profile' } },
  { path: '/:pathMatch(.*)*', component: NotFoundView, meta: { title: 'Page Not Found' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (to.hash) return { el: to.hash, behavior: reducedMotion ? 'auto' : 'smooth' }
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

  if (to.path === '/' && isAuthenticated.value) {
    return { path: '/dashboard' }
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/', hash: '#auth-section' }
  }

  if (to.meta.subscriberOnly && currentUser.value.role === 'professional') {
    return { path: '/dashboard' }
  }
})

// Update document title and move focus to main content on every navigation
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — GoodFood` : 'GoodFood'
  nextTick(() => {
    const main = document.getElementById('main-content')
    if (main) main.focus()
  })
})

export default router
