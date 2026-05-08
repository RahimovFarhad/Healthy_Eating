<template>
  <div id="app">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppNavbar />
    <main id="main-content" tabindex="-1">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import ToastContainer from './components/ToastContainer.vue'
</script>
