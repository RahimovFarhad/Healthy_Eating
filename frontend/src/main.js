// main.js — Application entry point
// This file boots the Vue app, registers the router, and imports global CSS.

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// Bootstrap CSS (layout, grid, utilities)
import 'bootstrap/dist/css/bootstrap.min.css'
// Bootstrap JS bundle (includes Popper — needed for dropdowns, tooltips, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Our custom design-system overrides
import './style.css'

// Mount the app to the #app div in index.html
createApp(App).use(router).mount('#app')
