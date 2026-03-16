<template>
  <div class="dashboard">

    <!-- KPIs row -->
    <div class="kpi-row" v-if="store.metriques">
      <div v-for="k in kpis" :key="k.label" class="kpi">
        <div class="kv" :style="{ color: k.color }">{{ k.val }}</div>
        <div class="kl mono">{{ k.label }}</div>
      </div>
    </div>
    <div v-else class="kpi-row">
      <div v-for="i in 5" :key="i" class="kpi skeleton"></div>
    </div>

    <!-- Row A : risque | trafic | stats -->
    <div class="row-a">
      <IframePanel
        :htmlFn="htmlRisque"
        :data="dataRisque"
        height="420px"
        :onMsg="null"
      />
      <IframePanel
        :htmlFn="htmlTrafic"
        :data="dataTrafic"
        height="420px"
        :onMsg="onTraficMsg"
        ref="traficRef"
      />
      <IframePanel
        :htmlFn="htmlStats"
        :data="dataStats"
        height="420px"
        :onMsg="null"
      />
    </div>

    <!-- Row B : liste attaques | détail -->
    <div class="row-b">
      <IframePanel
        :htmlFn="htmlAttaques"
        :data="dataAttaques"
        height="380px"
        :onMsg="onAttaquesMsg"
      />
      <IframePanel
        :htmlFn="htmlDetail"
        :data="dataDetail"
        height="380px"
        :onMsg="onDetailMsg"
      />
    </div>

    <!-- Row C : historique -->
    <IframePanel
      :htmlFn="htmlHistorique"
      :data="dataHistorique"
      height="300px"
      :onMsg="null"
    />

  </div>
</template>

<script setup>
import { computed, ref }       from 'vue'
import { useSentinelStore }    from '@/stores/sentinel'
import IframePanel             from '@/components/IframePanel.vue'
import { widgetRisque }        from '@/components/widgets/widgetRisque'
import { widgetTrafic }        from '@/components/widgets/widgetTrafic'
import { widgetStatsTypes }    from '@/components/widgets/widgetStatsTypes'
import { widgetAttaques }      from '@/components/widgets/widgetAttaques'
import { widgetDetailAlerte }  from '@/components/widgets/widgetDetailAlerte'
import { widgetHistorique }    from '@/components/widgets/widgetHistorique'
import { api }                 from '@/services/api'

const store    = useSentinelStore()
const traficRef = ref(null)

// ── htmlFn : fonctions passées à IframePanel ──────────────────
// Chaque function(data) retourne le HTML complet du widget
const htmlRisque    = (d) => widgetRisque(d)
const htmlTrafic    = (d) => widgetTrafic(d)
const htmlStats     = (d) => widgetStatsTypes(d)
const htmlAttaques  = (d) => widgetAttaques(d)
const htmlDetail    = (d) => widgetDetailAlerte(d)
const htmlHistorique= (d) => widgetHistorique(d)

// ── data réactifs envoyés dans chaque iframe ──────────────────
const dataRisque     = computed(() => ({ metriques: store.metriques }))
const dataTrafic     = ref({ trafic: { labels:[], normal:[], attaque:[] } })
const dataStats      = computed(() => ({ statsTypes: store.statsTypes }))
const dataAttaques   = computed(() => ({ attaques: store.attaques }))
const dataDetail     = computed(() => ({ alerteSelectee: store.alerteSelectee }))
const dataHistorique = computed(() => ({ historique: store.historique.slice(0,60) }))

// Charger le trafic initial
api.getTrafic({ periode:'1h' }).then(t => { dataTrafic.value = { trafic: t } })

// ── Handlers messages entrants des iframes ────────────────────
function onAttaquesMsg(msg) {
  if (msg.type === 'ATTAQUE_SELECT') store.selectionner(msg.payload)
}

function onDetailMsg(msg) {
  if (msg.type === 'ALERTE_ACTION') {
    const { action, id } = msg.payload
    if (action === 'BLOQUER')  store.bloquerIP(id)
    if (action === 'IGNORER')  store.ignorer(id)
    if (action === 'ENQUETER') alert(`Enquête sur l'attaque #${id} — fonctionnalité à connecter au backend`)
  }
}

async function onTraficMsg(msg) {
  if (msg.type === 'REQUEST_TRAFIC') {
    const t = await api.getTrafic({ periode: msg.payload })
    dataTrafic.value = { trafic: t }
  }
}

// KPIs
const kpis = computed(() => {
  const m = store.metriques
  if (!m) return []
  return [
    { label:'ATTAQUES / JOUR', val:m.attaques_jour, color:'var(--red)'   },
    { label:'BLOQUÉES',        val:m.bloquees,       color:'var(--amber)' },
    { label:'IPs UNIQUES',     val:m.ips_uniques,    color:'var(--blue)'  },
    { label:'APPAREILS IoT',   val:m.appareils_actifs,color:'var(--cyan)' },
    { label:'PRÉCISION IA',    val:(m.precision*100).toFixed(1)+'%', color:'var(--green)' },
  ]
})
</script>

<style scoped>
.dashboard { display:flex; flex-direction:column; gap:12px; }

.kpi-row   { display:grid; grid-template-columns:repeat(5,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:4px; overflow:hidden; }
.kpi       { background:var(--bg1); padding:13px 16px; }
.kpi.skeleton { height:62px; animation:pulse 1.5s ease-in-out infinite; background:var(--bg2); }
.kv        { font-size:26px; font-weight:700; font-family:var(--mono); line-height:1; }
.kl        { font-size:9px; color:var(--text3); letter-spacing:1.5px; text-transform:uppercase; margin-top:4px; }

.row-a     { display:grid; grid-template-columns:260px 1fr 260px; gap:12px; }
.row-b     { display:grid; grid-template-columns:1fr 320px; gap:12px; }

@media (max-width:1200px) {
  .row-a   { grid-template-columns: 240px 1fr; }
  .row-a > :last-child { grid-column: 1 / -1; height:240px !important; }
}
@media (max-width:900px) {
  .row-a, .row-b { grid-template-columns: 1fr; }
  .kpi-row       { grid-template-columns: repeat(3,1fr); }
}
</style>
