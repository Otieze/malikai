<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-h1">Rapports & Performances IA</h1>
        <p class="page-sub mono">Métriques du modèle ML — précision, rappel, F1, accuracy</p>
      </div>
    </div>

    <!-- Métriques IA -->
    <div class="metrics-grid" v-if="store.metriques">
      <div v-for="m in metriquesIA" :key="m.label" class="metric-card">
        <div class="mc-val" :style="{ color: m.color }">{{ m.val }}</div>
        <div class="mc-label mono">{{ m.label }}</div>
        <div class="mc-bar">
          <div class="mc-fill" :style="{ width: m.pct+'%', background: m.color }"></div>
        </div>
      </div>
    </div>

    <!-- Graphique confusion + distribution dans iframes -->
    <div class="row-2">
      <IframePanel :htmlFn="htmlMatrice"  :data="dataMatrice"  height="320px" :onMsg="null" />
      <IframePanel :htmlFn="htmlRapport"  :data="dataRapport"  height="320px" :onMsg="onRapportMsg" />
    </div>

    <!-- Historique performances -->
    <IframePanel :htmlFn="htmlPerf" :data="dataPerf" height="260px" :onMsg="null" />
  </div>
</template>

<script setup>
import { computed }         from 'vue'
import { useSentinelStore } from '@/stores/sentinel'
import IframePanel          from '@/components/IframePanel.vue'
import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

const store = useSentinelStore()

const metriquesIA = computed(() => {
  const m = store.metriques
  if (!m) return []
  return [
    { label:'PRÉCISION',  val: m.precision, pct: m.precision*100,  color:'var(--cyan)'   },
    { label:'RAPPEL',     val: m.rappel,    pct: m.rappel*100,     color:'var(--green)'  },
    { label:'F1 SCORE',   val: m.f1,        pct: m.f1*100,         color:'var(--amber)'  },
    { label:'ACCURACY',   val: m.accuracy,  pct: m.accuracy*100,   color:'var(--purple)' },
  ]
})

// ── Widget matrice de confusion ───────────────────────────────
const htmlMatrice = () => {
  const vals = [[142,8],[12,238]]  // mock — remplacer par données backend
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);text-transform:uppercase;font-family:var(--mono)}
.body{flex:1;display:flex;align-items:center;justify-content:center;padding:20px}
.matrix{display:grid;grid-template-columns:auto 1fr 1fr;grid-template-rows:auto 1fr 1fr;gap:2px}
.corner{width:60px}
.hdr{padding:8px 12px;text-align:center;font-family:var(--mono);font-size:10px;
  color:var(--text3);letter-spacing:1px;background:var(--bg2)}
.cell{width:100px;height:80px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;border-radius:3px}
.cv{font-size:28px;font-weight:700;font-family:var(--mono);line-height:1}
.cl{font-size:9px;font-family:var(--mono);letter-spacing:1px;margin-top:4px}
.rlbl{padding:8px 12px;display:flex;align-items:center;font-family:var(--mono);
  font-size:10px;color:var(--text3);letter-spacing:1px;writing-mode:horizontal-tb}
.legend{padding:14px 16px;display:flex;gap:20px;justify-content:center;flex-shrink:0;
  border-top:1px solid var(--border)}
.leg{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:10px;color:var(--text2)}
.leg-sq{width:12px;height:12px;border-radius:2px}
</style></head><body>${PARENT_MSG}
<div class="top"><span class="ptitle">Matrice de Confusion</span><span class="sev-badge moyen">SIMULÉE</span></div>
<div class="body">
  <div class="matrix">
    <div class="corner"></div>
    <div class="hdr">PRÉDIT: NORMAL</div>
    <div class="hdr">PRÉDIT: ATTAQUE</div>
    <div class="rlbl">RÉEL: NORMAL</div>
    <div class="cell" style="background:rgba(0,229,160,.12);border:1px solid rgba(0,229,160,.3)">
      <div class="cv" style="color:var(--green)">${vals[0][0]}</div>
      <div class="cl" style="color:var(--green)">VRAIS+</div>
    </div>
    <div class="cell" style="background:rgba(255,59,92,.08);border:1px solid rgba(255,59,92,.25)">
      <div class="cv" style="color:var(--red)">${vals[0][1]}</div>
      <div class="cl" style="color:var(--red)">FAUX+</div>
    </div>
    <div class="rlbl">RÉEL: ATTAQUE</div>
    <div class="cell" style="background:rgba(245,166,35,.08);border:1px solid rgba(245,166,35,.25)">
      <div class="cv" style="color:var(--amber)">${vals[1][0]}</div>
      <div class="cl" style="color:var(--amber)">FAUX−</div>
    </div>
    <div class="cell" style="background:rgba(0,229,160,.12);border:1px solid rgba(0,229,160,.3)">
      <div class="cv" style="color:var(--green)">${vals[1][1]}</div>
      <div class="cl" style="color:var(--green)">VRAIS−</div>
    </div>
  </div>
</div>
<div class="legend">
  <div class="leg"><div class="leg-sq" style="background:rgba(0,229,160,.3)"></div>Bonne classification</div>
  <div class="leg"><div class="leg-sq" style="background:rgba(255,59,92,.2)"></div>Erreur</div>
</div>
</body></html>`
}

// ── Widget génération rapport ─────────────────────────────────
const htmlRapport = () => `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);text-transform:uppercase;font-family:var(--mono)}
.body{flex:1;padding:18px;display:flex;flex-direction:column;gap:14px}
.form-group{display:flex;flex-direction:column;gap:5px}
.flbl{font-size:9px;font-family:var(--mono);color:var(--text3);letter-spacing:2px;text-transform:uppercase}
.finput,.fsel{background:var(--bg2);border:1px solid var(--border2);border-radius:3px;
  padding:7px 10px;color:var(--text1);font-family:var(--mono);font-size:11px;
  letter-spacing:.5px;outline:none;width:100%}
.finput:focus,.fsel:focus{border-color:var(--cyan)}
.checks{display:flex;flex-direction:column;gap:6px}
.chk{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:11px;color:var(--text2);cursor:pointer}
.chk input{accent-color:var(--cyan);width:13px;height:13px}
.btn-gen{padding:10px;border-radius:3px;background:var(--cyanbg);border:1px solid rgba(0,212,255,.4);
  color:var(--cyan);font-family:var(--mono);font-size:11px;letter-spacing:1px;cursor:pointer;
  font-weight:700;transition:all .15s;width:100%}
.btn-gen:hover{background:rgba(0,212,255,.18)}
.status{font-size:10px;font-family:var(--mono);color:var(--text3);text-align:center;
  letter-spacing:.5px;min-height:16px}
</style></head><body>${PARENT_MSG}
<div class="top"><span class="ptitle">Générer un Rapport</span></div>
<div class="body">
  <div class="form-group">
    <div class="flbl">Période</div>
    <select class="fsel" id="periode">
      <option value="24h">Dernières 24 heures</option>
      <option value="7j">7 derniers jours</option>
      <option value="30j">30 derniers jours</option>
    </select>
  </div>
  <div class="form-group">
    <div class="flbl">Format</div>
    <select class="fsel" id="format">
      <option value="pdf">PDF</option>
      <option value="json">JSON</option>
      <option value="csv">CSV</option>
    </select>
  </div>
  <div class="form-group">
    <div class="flbl">Inclure</div>
    <div class="checks">
      <label class="chk"><input type="checkbox" checked id="c-stats"/> Statistiques d'attaques</label>
      <label class="chk"><input type="checkbox" checked id="c-perf"/>  Performances IA</label>
      <label class="chk"><input type="checkbox" id="c-raw"/>           Données brutes</label>
      <label class="chk"><input type="checkbox" checked id="c-graphe"/>Graphiques</label>
    </div>
  </div>
  <button class="btn-gen" onclick="generer()">GÉNÉRER LE RAPPORT →</button>
  <div class="status" id="status"></div>
</div>
<script>
function generer() {
  const status = document.getElementById('status')
  status.style.color = 'var(--cyan)'
  status.textContent = 'Génération en cours...'
  setTimeout(()=>{
    toParent({ type:'GENERER_RAPPORT', payload:{
      periode: document.getElementById('periode').value,
      format:  document.getElementById('format').value,
      inclure: {
        stats:  document.getElementById('c-stats').checked,
        perf:   document.getElementById('c-perf').checked,
        raw:    document.getElementById('c-raw').checked,
        graphes:document.getElementById('c-graphe').checked,
      }
    }})
    status.style.color = 'var(--green)'
    status.textContent = '✓ Rapport envoyé au backend'
    setTimeout(()=>{ status.textContent='' }, 4000)
  }, 800)
}
<\/script></body></html>`

// ── Widget courbe performances dans le temps ──────────────────
const htmlPerf = () => {
  const labels = Array.from({length:12},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-11+i)
    return d.toLocaleDateString('fr-FR',{month:'short'})
  })
  const prec = labels.map(()=> +(0.88+Math.random()*.1).toFixed(3))
  const rapp = labels.map(()=> +(0.85+Math.random()*.12).toFixed(3))
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
  display:flex;align-items:center;justify-content:space-between}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);text-transform:uppercase;font-family:var(--mono)}
.leg{display:flex;gap:14px}
.li{display:flex;align-items:center;gap:5px;font-size:10px;font-family:var(--mono);color:var(--text3)}
.ld{width:10px;height:2px;border-radius:1px}
.cw{flex:1;padding:10px 14px;min-height:0}
canvas{width:100%!important;height:100%!important}
</style></head><body>${PARENT_MSG}
<div class="top">
  <span class="ptitle">Performances IA dans le Temps</span>
  <div class="leg">
    <div class="li"><div class="ld" style="background:var(--cyan)"></div>PRÉCISION</div>
    <div class="li"><div class="ld" style="background:var(--green)"></div>RAPPEL</div>
  </div>
</div>
<div class="cw"><canvas id="c"></canvas></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<script>
setTimeout(()=>{
  new Chart(document.getElementById('c').getContext('2d'),{
    type:'line',
    data:{
      labels:${JSON.stringify(labels)},
      datasets:[
        {label:'Précision',data:${JSON.stringify(prec)},borderColor:'#00d4ff',
          backgroundColor:'rgba(0,212,255,.06)',borderWidth:1.5,tension:.4,pointRadius:2,
          pointBackgroundColor:'#00d4ff',fill:true},
        {label:'Rappel',data:${JSON.stringify(rapp)},borderColor:'#00e5a0',
          backgroundColor:'rgba(0,229,160,.06)',borderWidth:1.5,tension:.4,pointRadius:2,
          pointBackgroundColor:'#00e5a0',fill:true},
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{
        backgroundColor:'rgba(15,19,24,.95)',titleColor:'#8a9ab5',
        titleFont:{family:'Share Tech Mono',size:10},bodyColor:'#e8edf5',
        bodyFont:{family:'Share Tech Mono',size:11},borderColor:'#1e2d42',borderWidth:1}},
      scales:{
        x:{grid:{color:'rgba(30,45,66,.5)',drawBorder:false},ticks:{color:'#4a5a72',font:{family:'Share Tech Mono',size:9}}},
        y:{grid:{color:'rgba(30,45,66,.4)',drawBorder:false},ticks:{color:'#4a5a72',font:{family:'Share Tech Mono',size:9}},
          min:.8,max:1.0,beginAtZero:false}
      }
    }
  })
},200)
<\/script></body></html>`
}

const dataMatrice = computed(() => ({}))
const dataRapport = computed(() => ({}))
const dataPerf    = computed(() => ({}))

function onRapportMsg(msg) {
  if (msg.type === 'GENERER_RAPPORT') {
    // Connecter au backend : api.genererRapport(msg.payload)
    console.log('[Rapport] paramètres:', msg.payload)
  }
}
</script>

<style scoped>
.page          { display:flex; flex-direction:column; gap:14px; }
.page-header   { margin-bottom:2px; }
.page-h1       { font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text1); }
.page-sub      { font-size:10px; color:var(--text3); letter-spacing:1px; margin-top:3px; font-family:var(--mono); }
.metrics-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:1px;
  background:var(--border); border:1px solid var(--border); border-radius:4px; overflow:hidden; }
.metric-card   { background:var(--bg1); padding:16px; }
.mc-val        { font-size:32px; font-weight:700; font-family:var(--mono); line-height:1; }
.mc-label      { font-size:9px; color:var(--text3); letter-spacing:2px; text-transform:uppercase; margin:6px 0 10px; }
.mc-bar        { height:4px; background:var(--bg3); border-radius:2px; overflow:hidden; }
.mc-fill       { height:100%; border-radius:2px; transition:width 1.2s ease; }
.row-2         { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:900px) {
  .metrics-grid { grid-template-columns:repeat(2,1fr); }
  .row-2        { grid-template-columns:1fr; }
}
</style>
