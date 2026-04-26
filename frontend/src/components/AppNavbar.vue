<template>
  <nav class="navbar navbar-expand-lg navbar-gf px-4">

    <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
      <div style="background:#5a9e56;border-radius:6px;padding:4px 8px;font-size:1.1rem;">🌿</div>
      <span class="navbar-brand-text">GoodFood</span>
    </RouterLink>

    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarMain">

      <ul v-if="!isAuthenticated" class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        <li class="nav-item"><a class="nav-link" href="#">For Professionals</a></li>
        <li class="nav-item">
          <a href="#auth-section" class="btn btn-gf-outline btn-sm">Log In</a>
        </li>
        <li class="nav-item">
          <a href="#auth-section" class="btn btn-gf btn-sm">Sign Up</a>
        </li>
      </ul>

      <ul v-else class="navbar-nav ms-auto align-items-center gap-3">
        <li class="nav-item">
          <RouterLink class="nav-link" to="/dashboard"
                      :class="{ active: $route.path === '/dashboard' }">Dashboard</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/diary"
                      :class="{ active: $route.path === '/diary' }">Food Diary</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/nutrition"
                      :class="{ active: $route.path === '/nutrition' }">Nutrition</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/recipes"
                      :class="{ active: $route.path === '/recipes' }">Recipes</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/messages"
                      :class="{ active: $route.path === '/messages' }">Messages</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" to="/goals"
                      :class="{ active: $route.path === '/goals' }">Goals</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/profile" class="text-decoration-none"
                      :title="`View profile (${currentUser.name || 'account'})`">
            <div class="avatar-circle ms-2" style="cursor:pointer;">{{ initials }}</div>
          </RouterLink>
        </li>
        <li class="nav-item">
          <button class="btn btn-outline-light btn-sm ms-1" @click="handleLogout">Log Out</button>
        </li>
      </ul>

    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated, currentUser, logout } from '../auth.js'

const router = useRouter()

const initials = computed(() => {
  const parts = currentUser.value.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('')
})

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>
