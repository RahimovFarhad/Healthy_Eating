<!--
  App.vue — Root component
  This is the shell that wraps every page.
  It renders:
    1. AppNavbar  — top navigation bar (always visible)
    2. <RouterView> — the current page component, swapped by vue-router
    3. AppFooter  — bottom footer (always visible)
-->
<template>
  <div id="app">
    <!-- Navigation bar is shared across all pages -->
    <AppNavbar />

    <!-- RouterView renders whichever view matches the current URL -->
    <main>
      <RouterView />
    </main>

    <!-- Footer is shared across all pages -->
    <AppFooter />
  </div>

</template>

<script setup>
// Import shared layout components
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>
