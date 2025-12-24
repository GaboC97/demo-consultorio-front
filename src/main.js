import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css' // El archivo donde pegamos las 3 líneas de Tailwind

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')