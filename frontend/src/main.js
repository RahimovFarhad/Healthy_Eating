import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue error]', info, err)
}
app.use(router).mount('#app')