<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-h1">Paramètres</h1>
      <p class="page-sub mono">Configuration de l'agent IA et de l'interface</p>
    </div>

    <div class="settings-grid">
      <!-- Connexion backend -->
      <div class="s-section">
        <div class="s-title mono">CONNEXION BACKEND</div>
        <div class="s-body">
          <div class="s-row">
            <span class="s-label">URL API REST</span>
            <input class="s-input" v-model="cfg.apiUrl" placeholder="http://localhost:8000/api/v1" />
          </div>
          <div class="s-row">
            <span class="s-label">WebSocket URL</span>
            <input class="s-input" v-model="cfg.wsUrl"  placeholder="ws://localhost:8000/ws/alertes" />
          </div>
          <div class="s-row">
            <span class="s-label">Mode Mock (frontend seul)</span>
            <label class="toggle">
              <input type="checkbox" v-model="cfg.useMock" />
              <span class="track"><span class="thumb"></span></span>
            </label>
          </div>
          <div class="s-note mono">Modifiez USE_MOCK dans src/services/api.js pour basculer définitivement.</div>
        </div>
      </div>

      <!-- Modèle IA -->
      <div class="s-section">
        <div class="s-title mono">MODÈLE IA</div>
        <div class="s-body">
          <div class="s-row">
            <span class="s-label">Modèle actif</span>
            <select class="s-sel" v-model="cfg.modele">
              <option>Random Forest v2.4</option>
              <option>SVM v1.2</option>
              <option>Neural Network v3.0</option>
            </select>
          </div>
          <div class="s-row">
            <span class="s-label">Seuil de détection (%)</span>
            <div class="slider-wrap">
              <input type="range" min="50" max="99" v-model="cfg.seuil" class="s-range" />
              <span class="s-val mono">{{ cfg.seuil }}%</span>
            </div>
          </div>
          <div class="s-row">
            <span class="s-label">Intervalle rafraîchissement (s)</span>
            <div class="slider-wrap">
              <input type="range" min="1" max="30" v-model="cfg.intervalle" class="s-range" />
              <span class="s-val mono">{{ cfg.intervalle }}s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertes -->
      <div class="s-section">
        <div class="s-title mono">ALERTES & NOTIFICATIONS</div>
        <div class="s-body">
          <div class="s-row" v-for="opt in alertOptions" :key="opt.key">
            <span class="s-label">{{ opt.label }}</span>
            <label class="toggle">
              <input type="checkbox" v-model="cfg[opt.key]" />
              <span class="track"><span class="thumb"></span></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Appareils IoT -->
      <div class="s-section">
        <div class="s-title mono">APPAREILS IoT SURVEILLÉS</div>
        <div class="s-body">
          <div class="dev-list">
            <div v-for="d in store.appareils" :key="d.nom" class="dev-row">
              <div class="dev-dot" :class="d.statut==='EN LIGNE'?'on':d.statut==='ALERTE'?'al':'off'"></div>
              <div class="dev-info">
                <div class="dev-name">{{ d.nom }}</div>
                <div class="dev-ip mono">{{ d.ip }}</div>
              </div>
              <span class="sev-badge" :class="d.statut==='EN LIGNE'?'faible':d.statut==='ALERTE'?'eleve':'moyen'">
                {{ d.statut }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions-row">
      <button class="btn-save"    @click="sauvegarder">SAUVEGARDER</button>
      <button class="btn-reset"   @click="reinitialiser">RÉINITIALISER</button>
      <button class="btn-test"    @click="testerConnexion">TESTER LA CONNEXION</button>
    </div>
    <div class="save-status mono" v-if="statusMsg" :class="statusOk?'ok':'err'">{{ statusMsg }}</div>
  </div>
</template>

<script setup>
import { reactive, ref }    from 'vue'
import { useSentinelStore } from '@/stores/sentinel'

const store = useSentinelStore()

const cfg = reactive({
  apiUrl:    'http://localhost:8000/api/v1',
  wsUrl:     'ws://localhost:8000/ws/alertes',
  useMock:   true,
  modele:    'Random Forest v2.4',
  seuil:     75,
  intervalle:3,
  notifCritique: true,
  notifEleve:    true,
  notifMoyen:    false,
  autoBlock:     false,
  sonAlertes:    false,
})

const alertOptions = [
  { key:'notifCritique', label:'Notifier attaques critiques' },
  { key:'notifEleve',    label:'Notifier attaques élevées' },
  { key:'notifMoyen',    label:'Notifier attaques moyennes' },
  { key:'autoBlock',     label:'Blocage automatique IP' },
  { key:'sonAlertes',    label:'Sons d\'alerte' },
]

const statusMsg = ref('')
const statusOk  = ref(true)

function sauvegarder() {
  // Connecter à : api.sauvegarderConfig(cfg) quand backend prêt
  localStorage.setItem('sentinel_cfg', JSON.stringify(cfg))
  statusMsg.value = '✓ Configuration sauvegardée localement'
  statusOk.value  = true
  setTimeout(() => statusMsg.value = '', 3000)
}
function reinitialiser() {
  Object.assign(cfg, { seuil:75, intervalle:3, notifCritique:true, notifEleve:true })
  statusMsg.value = '↺ Valeurs par défaut restaurées'
  statusOk.value  = true
  setTimeout(() => statusMsg.value = '', 3000)
}
async function testerConnexion() {
  statusMsg.value = '⟳ Test en cours...'
  statusOk.value  = true
  await new Promise(r => setTimeout(r, 1200))
  if (cfg.useMock) {
    statusMsg.value = '✓ Mode mock actif — backend non requis'
    statusOk.value  = true
  } else {
    statusMsg.value = '✗ Impossible de joindre le backend (mode réel désactivé)'
    statusOk.value  = false
  }
  setTimeout(() => statusMsg.value = '', 4000)
}
</script>

<style scoped>
.page          { display:flex; flex-direction:column; gap:16px; }
.page-header   { margin-bottom:2px; }
.page-h1       { font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text1); }
.page-sub      { font-size:10px; color:var(--text3); letter-spacing:1px; margin-top:3px; font-family:var(--mono); }
.settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.s-section     { background:var(--bg1); border:1px solid var(--border); border-radius:4px; overflow:hidden; }
.s-title       { padding:11px 16px; border-bottom:1px solid var(--border);
  font-size:10px; font-weight:700; letter-spacing:2px; color:var(--text2); text-transform:uppercase; }
.s-body        { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
.s-row         { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.s-label       { font-size:12px; color:var(--text2); flex:1; }
.s-input       { background:var(--bg2); border:1px solid var(--border2); border-radius:3px;
  padding:5px 9px; color:var(--text1); font-family:var(--mono); font-size:10px;
  letter-spacing:.5px; outline:none; width:220px; }
.s-input:focus,.s-sel:focus { border-color:var(--cyan); }
.s-sel         { background:var(--bg2); border:1px solid var(--border2); border-radius:3px;
  padding:5px 9px; color:var(--text1); font-family:var(--mono); font-size:10px;
  letter-spacing:.5px; outline:none; cursor:pointer; }
.slider-wrap   { display:flex; align-items:center; gap:10px; }
.s-range       { accent-color:var(--cyan); width:120px; cursor:pointer; }
.s-val         { font-size:12px; color:var(--cyan); min-width:36px; text-align:right; }
.s-note        { font-size:9px; color:var(--text3); letter-spacing:.5px; line-height:1.6;
  background:var(--bg2); border:1px solid var(--border); border-radius:3px; padding:8px; }
.toggle        { position:relative; cursor:pointer; }
.toggle input  { opacity:0; position:absolute; }
.track         { display:block; width:32px; height:18px; background:var(--border2);
  border-radius:9px; transition:background .2s; }
.toggle input:checked + .track { background:var(--cyan); }
.thumb         { position:absolute; top:2px; left:2px; width:14px; height:14px;
  background:#fff; border-radius:50%; transition:transform .2s; pointer-events:none; }
.toggle input:checked ~ .track .thumb { transform:translateX(14px); }
/* fix: thumb inside track */
.track { position:relative; }
.track .thumb { position:absolute; }

.dev-list      { display:flex; flex-direction:column; gap:8px; max-height:240px; overflow-y:auto; }
.dev-row       { display:flex; align-items:center; gap:10px; padding:7px 0;
  border-bottom:1px solid var(--border); }
.dev-dot       { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.dev-dot.on    { background:var(--green); box-shadow:0 0 5px var(--green); animation:pulse 2s ease-in-out infinite; }
.dev-dot.al    { background:var(--amber); }
.dev-dot.off   { background:var(--text3); }
.dev-info      { flex:1; }
.dev-name      { font-size:12px; font-weight:600; color:var(--text1); }
.dev-ip        { font-size:10px; color:var(--text3); margin-top:1px; }

.actions-row   { display:flex; gap:10px; flex-wrap:wrap; }
.btn-save,.btn-reset,.btn-test {
  padding:9px 20px; border-radius:3px; font-family:var(--mono); font-size:11px;
  letter-spacing:1px; cursor:pointer; font-weight:700; transition:all .15s; }
.btn-save      { background:var(--cyanbg); border:1px solid rgba(0,212,255,.45); color:var(--cyan); }
.btn-save:hover{ background:rgba(0,212,255,.18); }
.btn-reset     { background:var(--bg2); border:1px solid var(--border2); color:var(--text2); }
.btn-test      { background:var(--greenbg); border:1px solid rgba(0,229,160,.4); color:var(--green); }
.save-status   { font-size:11px; letter-spacing:.5px; }
.save-status.ok{ color:var(--green); }
.save-status.err{ color:var(--red); }
@media (max-width:900px) { .settings-grid { grid-template-columns:1fr; } }
</style>
