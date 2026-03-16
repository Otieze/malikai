<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-h1">Analyse du Trafic Réseau</h1>
        <p class="page-sub mono">Surveillance temps réel des flux IoT — protocoles MQTT, CoAP, TCP/UDP</p>
      </div>
    </div>

    <!-- Graphique principal -->
    <IframePanel
      :htmlFn="htmlTrafic"
      :data="dataTrafic"
      height="420px"
      :onMsg="onTraficMsg"
    />

    <!-- Ligne 2 : appareils + stats -->
    <div class="row-2">
      <IframePanel :htmlFn="htmlAppareils" :data="dataAppareils" height="340px" :onMsg="null" />
      <IframePanel :htmlFn="htmlStats"     :data="dataStats"     height="340px" :onMsg="null" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useSentinelStore }         from '@/stores/sentinel'
import IframePanel                  from '@/components/IframePanel.vue'
import { widgetTrafic }             from '@/components/widgets/widgetTrafic'
import { widgetStatsTypes }         from '@/components/widgets/widgetStatsTypes'
import { widgetAppareils }          from '@/components/widgets/widgetAppareils'
import { api }                      from '@/services/api'

const store      = useSentinelStore()
const dataTrafic = ref({ trafic: { labels:[], normal:[], attaque:[] } })

const htmlTrafic    = (d) => widgetTrafic(d)
const htmlStats     = (d) => widgetStatsTypes(d)
const htmlAppareils = (d) => widgetAppareils(d)

const dataStats     = computed(() => ({ statsTypes: store.statsTypes }))
const dataAppareils = computed(() => ({ appareils:  store.appareils  }))

async function onTraficMsg(msg) {
  if (msg.type === 'REQUEST_TRAFIC') {
    const t = await api.getTrafic({ periode: msg.payload })
    dataTrafic.value = { trafic: t }
  }
}

onMounted(async () => {
  const t = await api.getTrafic({ periode: '1h' })
  dataTrafic.value = { trafic: t }
})
</script>

<style scoped>
.page        { display:flex; flex-direction:column; gap:14px; }
.page-header { margin-bottom:2px; }
.page-h1     { font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text1); }
.page-sub    { font-size:10px; color:var(--text3); letter-spacing:1px; margin-top:3px; font-family:var(--mono); }
.row-2       { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:900px) { .row-2 { grid-template-columns:1fr; } }
</style>
