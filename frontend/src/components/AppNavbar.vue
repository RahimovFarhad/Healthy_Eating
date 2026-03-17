<!--
  AppNavbar.vue — Top navigation bar

  This component has TWO modes:
    • Public mode  — shown on the homepage ("/"). Displays marketing links + Log In / Sign Up buttons.
    • Auth mode    — shown on all inner pages. Displays dashboard navigation links.

  The `isAuthenticated` computed property decides which mode to show.
  For this prototype it simply checks whether the current URL is "/" or not.
  In a real app you would check a user store / auth token instead.
-->
<template>
  <nav class="navbar navbar-expand-lg navbar-gf px-4">

    <!-- Brand logo + name — always links back to homepage -->
    <RouterLink class="navbar-brand d-flex align-items-center gap-2" to="/">
      <!-- Small green icon box -->
      <div style="background:#5a9e56;border-radius:6px;padding:4px 8px;font-size:1.1rem;">🌿</div>
      <span class="navbar-brand-text">GoodFood</span>
    </RouterLink>

    <!-- Hamburger button — visible on small screens, collapses the nav links -->
    <button class="navbar-toggler" type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Collapsible nav links section -->
    <div class="collapse navbar-collapse" id="navbarMain">

      <!-- ===== PUBLIC NAV (homepage only) ===== -->
      <ul v-if="!isAuthenticated" class="navbar-nav ms-auto align-items-center gap-2">
        <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
        <li class="nav-item"><a class="nav-link" href="#">For Professionals</a></li>
        <!-- Both buttons scroll to the auth section on the homepage -->
        <li class="nav-item">
          <a href="#auth-section" class="btn btn-gf-outline btn-sm">Log In</a>
        </li>
        <li class="nav-item">
          <a href="#auth-section" class="btn btn-gf btn-sm">Sign Up</a>
        </li>
      </ul>

      <!-- ===== AUTHENTICATED NAV (inner pages) ===== -->
      <ul v-else class="navbar-nav ms-auto align-items-center gap-3">
        <!-- Each link gets the Bootstrap "active" class when its path matches the current route -->
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
        <!-- User avatar showing initials -->
        <li class="nav-item">
          <div class="avatar-circle ms-2">{{ initials }}</div>
        </li>
        <!-- Logout button -->
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

// Build up to 2 initials from the stored name
const initials = computed(() => {
  const parts = currentUser.value.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('')
})

function handleLogout() {
  logout()
  router.push('/')
}
</script>
