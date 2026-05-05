import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
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
import ProfessionalRegisterView from '../views/ProfessionalRegisterView.vue'
import VerifyEmailView from '../views/VerifyEmailView.vue'
import VerifyEmailProfessionalView from '../views/VerifyEmailProfessionalView.vue'

const DashboardSwitch = {
  name: 'DashboardSwitch',
  render() {
    return currentUser.value.role === 'professional'
      ? h(ProfessionalDashboardView)
      : h(DashboardView)
  },
}

const routes = [
  { path: '/', component: HomeView },
  { path: '/register/professional', component: ProfessionalRegisterView },
  { path: '/verify-email', component: VerifyEmailView },
  { path: '/verify-email/professional', component: VerifyEmailProfessionalView },
  { path: '/dashboard', component: DashboardSwitch, meta: { requiresAuth: true } },
  { path: '/diary', component: FoodDiaryView, meta: { requiresAuth: true, subscriberOnly: true } },
  { path: '/nutrition', component: NutritionView, meta: { requiresAuth: true, subscriberOnly: true } },
  { path: '/recipes', component: RecipesView, meta: { requiresAuth: true, subscriberOnly: true } },
  { path: '/goals', component: GoalsView, meta: { requiresAuth: true, subscriberOnly: true } },
  { path: '/messages', component: MessagesView, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
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

  if (to.meta.subscriberOnly && currentUser.value.role === 'professional') {
    return { path: '/dashboard' }
  }
})

export default router
