import { createApp }    from 'vue'
import { createPinia }  from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/global.css'

import Dashboard  from './views/Dashboard.vue'
import Attaques   from './views/Attaques.vue'
import Trafic     from './views/Trafic.vue'
import Historique from './views/Historique.vue'
import Rapport    from './views/Rapport.vue'
import Parametres from './views/Parametres.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',           component: Dashboard,  name: 'dashboard'  },
    { path: '/attaques',   component: Attaques,   name: 'attaques'   },
    { path: '/trafic',     component: Trafic,     name: 'trafic'     },
    { path: '/historique', component: Historique, name: 'historique' },
    { path: '/rapport',    component: Rapport,    name: 'rapport'    },
    { path: '/parametres', component: Parametres, name: 'parametres' },
  ]
})

createApp(App).use(createPinia()).use(router).mount('#app')
