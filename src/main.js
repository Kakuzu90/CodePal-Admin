import { createApp } from 'vue'
import App from './App.vue'
import VueFeather from 'vue-feather'
import router from './router'
import 'vue3-toastify/dist/index.css';


createApp(App)
.use(router)
.component(VueFeather.name, VueFeather)
.mount('#app')
