import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetTrafic(data = {}) {
  const d = data.trafic || { labels:[], normal:[], attaque:[] }
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.legend{display:flex;gap:14px}
.leg-item{display:flex;align-items:center;gap:5px;
  font-size:10px;font-family:var(--mono);color:var(--text3)}
.leg-dot{width:10px;height:2px;border-radius:1px}
.controls{padding:10px 16px;display:flex;gap:6px;flex-shrink:0;border-bottom:1px solid var(--border)}
.btn{font-size:10px;font-family:var(--mono);letter-spacing:1px;padding:4px 10px;
  border:1px solid var(--border2);background:transparent;color:var(--text2);
  cursor:pointer;border-radius:2px;transition:all .15s}
.btn:hover,.btn.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyanbg)}
.chart-wrap{flex:1;padding:12px 16px;min-height:0}
canvas{width:100%!important;height:100%!important}
.stats-row{padding:8px 16px;border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);flex-shrink:0}
.stat{background:var(--bg1);padding:8px 12px;text-align:center}
.sval{font-size:16px;font-weight:700;font-family:var(--mono)}
.slbl{font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;margin-top:2px}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Trafic Réseau</span>
  <div class="legend">
    <div class="leg-item"><div class="leg-dot" style="background:var(--cyan)"></div>NORMAL</div>
    <div class="leg-item"><div class="leg-dot" style="background:var(--red)"></div>ATTAQUE</div>
  </div>
</div>
<div class="controls">
  <button class="btn active" onclick="charger('1h',this)">1H</button>
  <button class="btn" onclick="charger('6h',this)">6H</button>
  <button class="btn" onclick="charger('24h',this)">24H</button>
</div>
<div class="chart-wrap"><canvas id="chart"></canvas></div>
<div class="stats-row">
  <div class="stat"><div class="sval" id="s-peak" style="color:var(--red)">—</div><div class="slbl">PIC ATTAQUE</div></div>
  <div class="stat"><div class="sval" id="s-moy" style="color:var(--cyan)">—</div><div class="slbl">MOY. NORMAL</div></div>
  <div class="stat"><div class="sval" id="s-evts" style="color:var(--amber)">—</div><div class="slbl">ÉVÈNEMENTS</div></div>
  <div class="stat"><div class="sval" id="s-pct" style="color:var(--green)">—</div><div class="slbl">% ATTAQUE</div></div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<script>
let chart, traficData = ${JSON.stringify(d)}

function mkChart(d) {
  if (chart) chart.destroy()
  const ctx = document.getElementById('chart').getContext('2d')
  chart = new Chart(ctx, {
    type:'line',
    data:{
      labels: d.labels.filter((_,i)=>i%5===0),
      datasets:[
        {label:'Normal',data:d.normal.filter((_,i)=>i%5===0),
          borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,.06)',
          borderWidth:1.5,tension:.4,pointRadius:0,fill:true},
        {label:'Attaque',data:d.attaque.filter((_,i)=>i%5===0),
          borderColor:'#ff3b5c',backgroundColor:'rgba(255,59,92,.08)',
          borderWidth:1.5,tension:.4,pointRadius:0,fill:true},
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,animation:{duration:600},
      plugins:{legend:{display:false},tooltip:{
        backgroundColor:'rgba(15,19,24,.95)',
        titleColor:'#8a9ab5',titleFont:{family:'Share Tech Mono',size:10},
        bodyColor:'#e8edf5',bodyFont:{family:'Share Tech Mono',size:11},
        borderColor:'#1e2d42',borderWidth:1
      }},
      scales:{
        x:{grid:{color:'rgba(30,45,66,.5)',drawBorder:false},
          ticks:{color:'#4a5a72',font:{family:'Share Tech Mono',size:9},maxRotation:0,maxTicksLimit:8}},
        y:{grid:{color:'rgba(30,45,66,.4)',drawBorder:false},
          ticks:{color:'#4a5a72',font:{family:'Share Tech Mono',size:9},maxTicksLimit:5},beginAtZero:true}
      }
    }
  })
  updateStats(d)
}

function updateStats(d) {
  const peak = Math.max(...d.attaque)
  const moy  = Math.round(d.normal.reduce((a,b)=>a+b,0)/d.normal.length)
  const evts = d.attaque.filter(v=>v>200).length
  const pct  = Math.round(evts/d.attaque.length*100)
  document.getElementById('s-peak').textContent = peak>0?peak.toLocaleString('fr-FR'):'0'
  document.getElementById('s-moy').textContent  = moy.toLocaleString('fr-FR')
  document.getElementById('s-evts').textContent = evts
  document.getElementById('s-pct').textContent  = pct+'%'
}

function charger(periode, btn) {
  document.querySelectorAll('.btn').forEach(b=>b.classList.remove('active'))
  btn.classList.add('active')
  toParent({ type:'REQUEST_TRAFIC', payload: periode })
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type === 'UPDATE_DATA' && msg.payload?.trafic) {
      traficData = msg.payload.trafic; mkChart(traficData)
    }
    if (msg.type === 'TRAFIC_DATA') { mkChart(msg.payload) }
  } catch(_) {}
})

// Init après chargement Chart.js
document.addEventListener('DOMContentLoaded', () => {
  if (traficData.labels.length) mkChart(traficData)
})
setTimeout(()=>{ if(traficData.labels.length) mkChart(traficData) }, 200)
<\/script></body></html>`
}
