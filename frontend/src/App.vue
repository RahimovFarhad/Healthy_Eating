<template>
  <div id="app">
    <AppNavbar />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
</script>
