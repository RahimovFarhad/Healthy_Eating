<template>
  <nav aria-label="Main" class="navbar navbar-expand-lg navbar-gf px-4"
       @keydown.space.prevent="$event.target.tagName === 'A' && $event.target.click()">

    <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
      <div aria-hidden="true" style="font-size:1.4rem;">🌿</div>
      <span class="navbar-brand-text">GoodFood</span>
    </RouterLink>

    <button class="navbar-toggler" type="button"
            aria-controls="navbarMain"
            :aria-expanded="navExpanded.toString()"
            @click="navExpanded = !navExpanded"
            aria-label="Toggle navigation"
            style="border-color:#333333;">
      <span class="navbar-toggler-icon" style="background-image:url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 30 30%27%3e%3cpath stroke=%27%23333333%27 stroke-linecap=%27round%27 stroke-miterlimit=%2710%27 stroke-width=%272%27 d=%27M4 7h22M4 15h22M4 23h22%27/%3e%3c/svg%3e');"></span>
    </button>

    <div :class="['navbar-collapse', navExpanded ? 'show' : 'collapse']" id="navbarMain" ref="navMenuRef">

      <ul v-if="!isAuthenticated" class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><RouterLink class="nav-link" to="/#features">Features</RouterLink></li>
        <li class="nav-item"><RouterLink class="nav-link" to="/register/professional">For Professionals</RouterLink></li>
        <li class="nav-item">
          <RouterLink to="/#login-panel" class="btn btn-sm" style="background:transparent;color:#1a1a1a;border:1px solid #333333;border-radius:6px;padding:0.4rem 1rem;font-weight:600;transition:all 0.2s;" @mouseenter="$event.currentTarget.style.background='#f5f5f5'" @mouseleave="$event.currentTarget.style.background='transparent'">Log In</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/#signup-panel" class="btn btn-sm" style="background:#1a1a1a;color:#ffffff;border:1px solid #1a1a1a;border-radius:6px;padding:0.4rem 1rem;font-weight:600;transition:all 0.2s;" @mouseenter="$event.currentTarget.style.background='#333333'" @mouseleave="$event.currentTarget.style.background='#1a1a1a'">Sign Up</RouterLink>
        </li>
      </ul>

      <ul v-else class="navbar-nav ms-auto align-items-center gap-3">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/dashboard"
                      :class="{ active: $route.path === '/dashboard' }"
                      :aria-current="$route.path === '/dashboard' ? 'page' : undefined">Dashboard</RouterLink>
        </li>
        <template v-if="!isProfessional">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/diary"
                        :class="{ active: $route.path === '/diary' }"
                        :aria-current="$route.path === '/diary' ? 'page' : undefined">Food Diary</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/nutrition"
                        :class="{ active: $route.path === '/nutrition' }"
                        :aria-current="$route.path === '/nutrition' ? 'page' : undefined">Nutrition</RouterLink>
          </li>
        </template>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/recipes"
                      :class="{ active: $route.path.startsWith('/recipes') }"
                      :aria-current="$route.path.startsWith('/recipes') ? 'page' : undefined">Recipes</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/messages"
                      :class="{ active: $route.path === '/messages' }"
                      :aria-current="$route.path === '/messages' ? 'page' : undefined">Messages</RouterLink>
        </li>
        <li v-if="!isProfessional" class="nav-item">
          <RouterLink class="nav-link" to="/goals"
                      :class="{ active: $route.path === '/goals' }"
                      :aria-current="$route.path === '/goals' ? 'page' : undefined">Goals</RouterLink>
        </li>
        <li v-if="!isProfessional" class="nav-item">
          <RouterLink class="nav-link" to="/meal-plans"
                      :class="{ active: $route.path === '/meal-plans' }"
                      :aria-current="$route.path === '/meal-plans' ? 'page' : undefined">Meal Plans</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/profile" class="text-decoration-none"
                      :aria-label="`View profile for ${currentUser.name || 'account'}`">
            <div class="avatar-circle ms-2" aria-hidden="true" style="cursor:pointer;">{{ initials }}</div>
          </RouterLink>
        </li>
        <li class="nav-item">
          <button class="btn btn-sm ms-1" @click="handleLogout" style="background:transparent;color:#1a1a1a;border:1px solid #333333;border-radius:6px;padding:0.4rem 1rem;font-weight:600;transition:all 0.2s;" @mouseenter="$event.currentTarget.style.background='#f5f5f5'" @mouseleave="$event.currentTarget.style.background='transparent'">Log Out</button>
        </li>
      </ul>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { isAuthenticated, currentUser, logout } from '../auth.js'

const router = useRouter()
const route = useRoute()

const navExpanded = ref(false)
const navMenuRef = ref(null)

watch(route, () => { navExpanded.value = false })
watch(navExpanded, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      const firstFocusable = navMenuRef.value?.querySelector('a, button')
      firstFocusable?.focus()
    })
  }
})

const initials = computed(() => {
  const parts = currentUser.value.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('')
})

const isProfessional = computed(() => currentUser.value.role === 'professional')

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>
