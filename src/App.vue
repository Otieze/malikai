<template>
  <div class="shell">
    <!-- ─────── SIDEBAR ─────────────────────────────── -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="s-logo">
        <div class="logo-mark"><div class="logo-inner"></div></div>
        <Transition name="fade">
          <div v-if="!collapsed" class="logo-texts">
            <span class="logo-name">MALEK.AI</span>
            <span class="logo-sub">IoT SHIELD</span>
          </div>
        </Transition>
      </div>

      <nav class="s-nav">
        <RouterLink
          v-for="item in nav" :key="item.to" :to="item.to"
          class="nav-link" :title="collapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <Transition name="fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </Transition>
          <span v-if="item.badge && item.badge > 0 && !collapsed" class="nav-badge">
            {{ item.badge }}
          </span>
        </RouterLink>
      </nav>

      <button class="collapse-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Développer' : 'Réduire'">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path :d="collapsed?'M2 2l5 4-5 4':'M10 2L5 6l5 4'"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="s-foot">
        <div class="conn-row">
          <div class="dot" :class="store.connexion ? 'green' : 'red'"></div>
          <Transition name="fade">
            <span v-if="!collapsed" class="conn-lbl mono">
              {{ store.connexion ? 'AGENT EN LIGNE' : 'HORS LIGNE' }}
            </span>
          </Transition>
        </div>
      </div>
    </aside>

    <!-- ─────── MAIN ────────────────────────────────── -->
    <div class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="tb-left">
          <span class="page-title">{{ pageTitle }}</span>
          <span class="breadcrumb mono">MALIK.AI IoT / {{ pageTitle }}</span>
        </div>
        <div class="tb-right">
          <span class="clock mono">{{ heure }}</span>
          <span class="model-tag mono">IA: Random Forest v2.4</span>

          <!-- Cloche notifs -->
          <button class="notif-btn" @click.stop="showNotifs = !showNotifs">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
              <path d="M8 2a4 4 0 00-4 4v3L2 11h12l-2-2V6a4 4 0 00-4-4z"/>
              <path d="M6 13a2 2 0 004 0"/>
            </svg>
            <span v-if="store.nonLues > 0" class="notif-n">{{ store.nonLues }}</span>
          </button>

          <Transition name="fade">
            <div v-if="showNotifs" v-click-outside="() => showNotifs=false" class="notif-panel">
              <div class="np-head">
                <span class="panel-title">Notifications</span>
                <button class="np-read mono" @click="store.marquerLu()">Tout lu</button>
              </div>
              <div class="np-list">
                <div v-for="n in store.notifications.slice(0,15)" :key="n.id"
                     class="np-item" :class="{ unread: !n.lu }">
                  <div class="np-dot" :class="n.severite"></div>
                  <span class="np-msg mono">{{ n.message }}</span>
                </div>
                <div v-if="!store.notifications.length" class="np-empty mono">Aucune notification</div>
              </div>
            </div>
          </Transition>
        </div>
      </header>

      <!-- Router view -->
      <div class="view-area" @click="showNotifs = false">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>

    <!-- Toasts alertes critiques -->
    <TransitionGroup name="toast" tag="div" class="toasts">
      <div v-for="n in toasts" :key="n.id" class="toast">
        <span class="live-dot"></span>
        <span class="mono t-msg">{{ n.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute }       from 'vue-router'
import { useSentinelStore }                        from '@/stores/sentinel'

const store    = useSentinelStore()
const route    = useRoute()
const collapsed = ref(false)
const showNotifs = ref(false)
const heure    = ref('--:--:--')
let   clockIv

const TITLES = {
  dashboard:'Tableau de Bord', attaques:'Attaques Détectées',
  trafic:'Trafic Réseau', historique:'Historique', rapport:'Rapports', parametres:'Paramètres'
}
const pageTitle = computed(() => TITLES[route.name] ?? 'Dashboard')

const nav = computed(() => [
  { to:'/',           label:'Tableau de Bord', icon:ICO.grid,    badge:0 },
  { to:'/attaques',   label:'Attaques',         icon:ICO.shield,  badge:store.critiques.length },
  { to:'/trafic',     label:'Trafic Réseau',    icon:ICO.chart,   badge:0 },
  { to:'/historique', label:'Historique',        icon:ICO.clock,   badge:0 },
  { to:'/rapport',    label:'Rapports',          icon:ICO.doc,     badge:0 },
  { to:'/parametres', label:'Paramètres',        icon:ICO.gear,    badge:0 },
])

const toasts = computed(() =>
  store.notifications.filter(n=>!n.lu && n.severite==='critique').slice(0,3)
)

onMounted(async () => {
  await store.init()
  store.demarrer()
  clockIv = setInterval(() => {
    heure.value = new Date().toLocaleTimeString('fr-FR')
  }, 1000)
  heure.value = new Date().toLocaleTimeString('fr-FR')
})
onUnmounted(() => { store.arreter(); clearInterval(clockIv) })

// SVG icons inline
const ICO = {
  grid:   `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="1" y="1" width="6" height="6" rx="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.2"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 1L2 3.5v4C2 11.5 5 14 8 15c3-1 6-3.5 6-7v-4L8 1z"/></svg>`,
  chart:  `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><polyline points="1,12 5,7 9,9 13,3"/><line x1="1" y1="15" x2="15" y2="15"/></svg>`,
  clock:  `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6"/><polyline points="8,4 8,8 11,10"/></svg>`,
  doc:    `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 1h6l3 3v10a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z"/><polyline points="10,1 10,4 13,4"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="9" y2="11"/></svg>`,
  gear:   `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/></svg>`,
}
</script>

<style scoped>
.shell{display:flex;height:100vh;overflow:hidden;position:relative}

/* ── Sidebar ──────────────────────────────────────────────── */
.sidebar{width:var(--sidebar-w);background:var(--bg1);border-right:1px solid var(--border);
  display:flex;flex-direction:column;flex-shrink:0;transition:width .24s ease;overflow:hidden;z-index:100}
.sidebar.collapsed{width:var(--sidebar-collapsed)}
.s-logo{height:var(--header-h);padding:0 14px;display:flex;align-items:center;gap:10px;
  border-bottom:1px solid var(--border);flex-shrink:0}
.logo-mark{width:28px;height:28px;border:1.5px solid var(--cyan);border-radius:5px;
  display:flex;align-items:center;justify-content:center;background:var(--cyanbg);flex-shrink:0}
.logo-inner{width:12px;height:12px;border:1.5px solid var(--cyan);border-radius:2px;transform:rotate(45deg)}
.logo-texts{display:flex;flex-direction:column;white-space:nowrap}
.logo-name{font-size:15px;font-weight:700;letter-spacing:2.5px;color:var(--text1)}
.logo-sub{font-size:9px;color:var(--cyan);letter-spacing:3px;font-family:var(--mono)}

.s-nav{flex:1;padding:8px 0;overflow:hidden}
.nav-link{display:flex;align-items:center;gap:10px;padding:9px 14px;
  color:var(--text2);text-decoration:none;transition:color .14s,background .14s;
  white-space:nowrap;border-left:3px solid transparent}
.nav-link:hover{color:var(--text1);background:var(--bg2)}
.nav-link.router-link-active{color:var(--cyan);background:var(--cyanbg);border-left-color:var(--cyan)}
.nav-icon{flex-shrink:0;display:flex;align-items:center}
.nav-label{font-size:13px;font-weight:500;letter-spacing:.4px}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;border-radius:10px;
  padding:1px 6px;font-size:9px;font-family:var(--mono);font-weight:700}

.collapse-btn{margin:6px 10px;padding:6px;background:var(--bg2);border:1px solid var(--border);
  border-radius:3px;color:var(--text3);cursor:pointer;display:flex;align-items:center;
  justify-content:center;transition:color .14s,border-color .14s}
.collapse-btn:hover{color:var(--cyan);border-color:var(--cyan)}

.s-foot{padding:12px 14px;border-top:1px solid var(--border)}
.conn-row{display:flex;align-items:center;gap:8px}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;animation:pulse 2s ease-in-out infinite}
.dot.green{background:var(--green);box-shadow:0 0 6px var(--green)}
.dot.red  {background:var(--red);  box-shadow:0 0 6px var(--red)}
.conn-lbl{font-size:10px;color:var(--text3);letter-spacing:1px}

/* ── Main ────────────────────────────────────────────────── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:var(--header-h);background:var(--bg1);border-bottom:1px solid var(--border);
  padding:0 18px;display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;gap:12px}
.tb-left{display:flex;flex-direction:column}
.page-title{font-size:15px;font-weight:700;letter-spacing:1px;color:var(--text1)}
.breadcrumb{font-size:9px;color:var(--text3);letter-spacing:1.5px;margin-top:1px}
.tb-right{display:flex;align-items:center;gap:14px}
.clock{font-size:11px;color:var(--cyan);letter-spacing:1.5px;white-space:nowrap}
.model-tag{background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.22);
  border-radius:3px;padding:3px 8px;font-size:9px;color:var(--cyan);
  letter-spacing:1px;white-space:nowrap}

.notif-btn{position:relative;background:none;border:1px solid var(--border2);
  border-radius:3px;padding:5px 6px;color:var(--text2);cursor:pointer;
  display:flex;align-items:center;transition:color .14s,border-color .14s}
.notif-btn:hover{color:var(--cyan);border-color:var(--cyan)}
.notif-n{position:absolute;top:-5px;right:-5px;background:var(--red);color:#fff;
  border-radius:8px;padding:0 4px;font-size:8px;font-family:var(--mono);font-weight:700;min-width:14px;text-align:center}

.notif-panel{position:absolute;top:calc(var(--header-h)+4px);right:16px;
  width:300px;background:var(--bg1);border:1px solid var(--border);
  border-radius:4px;z-index:300;overflow:hidden}
.np-head{padding:10px 14px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between}
.panel-title{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);text-transform:uppercase;font-family:var(--mono)}
.np-read{font-size:9px;color:var(--cyan);background:none;border:none;cursor:pointer;
  font-family:var(--mono);letter-spacing:1px}
.np-list{max-height:320px;overflow-y:auto}
.np-item{padding:8px 14px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:8px;opacity:.55}
.np-item.unread{opacity:1;background:var(--bg2)}
.np-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.np-dot.critique{background:var(--red)} .np-dot.eleve{background:var(--amber)}
.np-dot.moyen{background:var(--blue)}   .np-dot.faible{background:var(--green)}
.np-msg{font-size:10px;color:var(--text2);letter-spacing:.2px}
.np-empty{padding:14px;text-align:center;font-size:10px;color:var(--text3);letter-spacing:1px}

.view-area{flex:1;overflow-y:auto;overflow-x:hidden;padding:14px}

/* ── Toasts ──────────────────────────────────────────────── */
.toasts{position:fixed;bottom:14px;right:14px;display:flex;
  flex-direction:column;gap:6px;z-index:500;pointer-events:none}
.toast{display:flex;align-items:center;gap:8px;padding:8px 13px;
  background:var(--bg2);border:1px solid rgba(255,59,92,.45);
  border-radius:3px;font-size:10px}
.t-msg{color:var(--text1);letter-spacing:.3px}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--red);
  display:inline-block;flex-shrink:0;animation:pulse 1s ease-in-out infinite}

.toast-enter-active{animation:slideIn .2s ease}
.toast-leave-active{transition:opacity .3s,transform .3s}
.toast-leave-to{opacity:0;transform:translateX(30px)}
</style>
