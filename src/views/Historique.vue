<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-h1">Historique des Événements</h1>
        <p class="page-sub mono">Journal complet de toutes les alertes et actions de sécurité</p>
      </div>
    </div>
    <IframePanel
      :htmlFn="htmlHistorique"
      :data="dataHistorique"
      height="calc(100vh - 180px)"
      :onMsg="null"
    />
  </div>
</template>

<script setup>
import { computed }           from 'vue'
import { useSentinelStore }   from '@/stores/sentinel'
import IframePanel            from '@/components/IframePanel.vue'
import { widgetHistorique }   from '@/components/widgets/widgetHistorique'

const store          = useSentinelStore()
const htmlHistorique = (d) => widgetHistorique(d)
const dataHistorique = computed(() => ({ historique: store.historique }))
</script>

<style scoped>
.page        { display:flex; flex-direction:column; gap:14px; height:100%; }
.page-header { flex-shrink:0; }
.page-h1     { font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text1); }
.page-sub    { font-size:10px; color:var(--text3); letter-spacing:1px; margin-top:3px; font-family:var(--mono); }
</style>
