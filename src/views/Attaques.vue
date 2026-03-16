<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-h1">Attaques Détectées</h1>
        <p class="page-sub mono">Analyse complète des menaces IoT identifiées par l'agent IA</p>
      </div>
      <div class="header-actions">
        <select class="sel mono" v-model="filtreSev" @change="onFiltreChange">
          <option value="">Toutes sévérités</option>
          <option value="critique">Critique</option>
          <option value="eleve">Élevé</option>
          <option value="moyen">Moyen</option>
          <option value="faible">Faible</option>
        </select>
        <button class="btn-action mono" @click="rafraichir">↺ Rafraîchir</button>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="quick-stats">
      <div v-for="s in quickStats" :key="s.label" class="qs-card">
        <div class="qs-val" :style="{ color: s.color }">{{ s.val }}</div>
        <div class="qs-lbl mono">{{ s.label }}</div>
      </div>
    </div>

    <!-- Grid principale : liste + détail -->
    <div class="grid-main">
      <IframePanel :htmlFn="htmlAttaques" :data="dataAttaques" height="600px" :onMsg="onListMsg" />
      <IframePanel :htmlFn="htmlDetail"   :data="dataDetail"   height="600px" :onMsg="onDetailMsg" />
    </div>

    <!-- Graphique stats par type -->
    <IframePanel :htmlFn="htmlStats" :data="dataStats" height="280px" :onMsg="null" />
  </div>
</template>

<script setup>
import { computed, ref }      from 'vue'
import { useSentinelStore }   from '@/stores/sentinel'
import IframePanel            from '@/components/IframePanel.vue'
import { widgetAttaques }     from '@/components/widgets/widgetAttaques'
import { widgetDetailAlerte } from '@/components/widgets/widgetDetailAlerte'
import { widgetStatsTypes }   from '@/components/widgets/widgetStatsTypes'

const store     = useSentinelStore()
const filtreSev = ref('')

const attaquesFiltrees = computed(() =>
  filtreSev.value
    ? store.attaques.filter(a => a.severite === filtreSev.value)
    : store.attaques
)

const htmlAttaques = (d) => widgetAttaques(d)
const htmlDetail   = (d) => widgetDetailAlerte(d)
const htmlStats    = (d) => widgetStatsTypes(d)

const dataAttaques = computed(() => ({ attaques: attaquesFiltrees.value }))
const dataDetail   = computed(() => ({ alerteSelectee: store.alerteSelectee }))
const dataStats    = computed(() => ({ statsTypes: store.statsTypes }))

function onListMsg(msg) {
  if (msg.type === 'ATTAQUE_SELECT') store.selectionner(msg.payload)
}
function onDetailMsg(msg) {
  if (msg.type === 'ALERTE_ACTION') {
    const { action, id } = msg.payload
    if (action === 'BLOQUER')  store.bloquerIP(id)
    if (action === 'IGNORER')  store.ignorer(id)
  }
}
async function rafraichir() { await store.init() }
function onFiltreChange()   {}

const quickStats = computed(() => {
  const a = store.attaques
  return [
    { label:'TOTAL',    val: a.length,                                                    color:'var(--text1)' },
    { label:'CRITIQUE', val: a.filter(x=>x.severite==='critique').length,                 color:'var(--red)'   },
    { label:'ÉLEVÉ',    val: a.filter(x=>x.severite==='eleve').length,                    color:'var(--amber)' },
    { label:'BLOQUÉES', val: a.filter(x=>x.statut==='BLOQUÉ').length,                     color:'var(--green)' },
    { label:'DÉTECTÉES',val: a.filter(x=>x.statut==='DÉTECTÉ').length,                    color:'var(--blue)'  },
  ]
})
</script>

<style scoped>
.page        { display:flex; flex-direction:column; gap:14px; }
.page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.page-h1     { font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text1); }
.page-sub    { font-size:10px; color:var(--text3); letter-spacing:1px; margin-top:3px; }
.header-actions { display:flex; gap:8px; align-items:center; }
.sel { background:var(--bg2); border:1px solid var(--border2); border-radius:3px;
  padding:5px 10px; color:var(--text1); font-family:var(--mono); font-size:10px;
  letter-spacing:1px; cursor:pointer; outline:none; }
.sel:focus { border-color:var(--cyan); }
.btn-action { background:var(--bg2); border:1px solid var(--border2); border-radius:3px;
  padding:5px 12px; color:var(--text2); font-size:10px; letter-spacing:1px;
  cursor:pointer; transition:all .14s; }
.btn-action:hover { border-color:var(--cyan); color:var(--cyan); }
.quick-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:1px;
  background:var(--border); border:1px solid var(--border); border-radius:4px; overflow:hidden; }
.qs-card { background:var(--bg1); padding:12px 16px; }
.qs-val  { font-size:24px; font-weight:700; font-family:var(--mono); line-height:1; }
.qs-lbl  { font-size:9px; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-top:4px; }
.grid-main { display:grid; grid-template-columns:1fr 320px; gap:12px; }
@media (max-width:900px) {
  .grid-main         { grid-template-columns:1fr; }
  .quick-stats       { grid-template-columns:repeat(3,1fr); }
}
</style>
