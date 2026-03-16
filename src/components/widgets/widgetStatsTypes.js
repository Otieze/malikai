import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetStatsTypes(data = {}) {
  const stats = data.statsTypes || []
  const max = stats.length ? Math.max(...stats.map(s=>s.count)) : 1
  const COLORS = ['#ff3b5c','#f5a623','#a855f7','#2196f3','#00d4ff','#00e5a0','#f06292','#80cbc4']

  const bars = stats.map((s, i) => `
    <div class="bar-row">
      <div class="bar-name mono">${s.type}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(s.count/max*100).toFixed(1)}%;background:${COLORS[i%COLORS.length]}"></div>
      </div>
      <div class="bar-count mono">${s.count}</div>
    </div>`).join('')

  const chartData = JSON.stringify({ labels: stats.map(s=>s.type), counts: stats.map(s=>s.count) })

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.period{font-size:10px;font-family:var(--mono);color:var(--text3);letter-spacing:1px}
.tabs{padding:8px 16px;display:flex;gap:6px;border-bottom:1px solid var(--border);flex-shrink:0}
.tab{font-size:9px;font-family:var(--mono);letter-spacing:1px;padding:3px 9px;
  border:1px solid var(--border2);background:transparent;color:var(--text3);
  cursor:pointer;border-radius:2px;transition:all .15s}
.tab.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyanbg)}
#view-bars{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
#view-chart{flex:1;padding:14px 16px;display:none}
.bar-row{display:flex;align-items:center;gap:10px}
.bar-name{font-size:11px;color:var(--text2);width:140px;flex-shrink:0;letter-spacing:.3px}
.bar-track{flex:1;height:7px;background:var(--bg3);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px;transition:width 1.2s ease}
.bar-count{font-size:11px;color:var(--text2);width:28px;text-align:right}
canvas{width:100%!important;height:100%!important}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Distribution par Type</span>
  <span class="period">DERNIÈRES 24H</span>
</div>
<div class="tabs">
  <button class="tab active" onclick="showView('bars',this)">BARRES</button>
  <button class="tab" onclick="showView('chart',this)">CAMEMBERT</button>
</div>
<div id="view-bars">${bars}</div>
<div id="view-chart"><canvas id="pie"></canvas></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"><\/script>
<script>
const COLORS = ['#ff3b5c','#f5a623','#a855f7','#2196f3','#00d4ff','#00e5a0','#f06292','#80cbc4']
let pieChart = null
let chartData = ${chartData}

function showView(v, btn) {
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'))
  btn.classList.add('active')
  document.getElementById('view-bars').style.display  = v==='bars'?'flex':'none'
  document.getElementById('view-chart').style.display = v==='chart'?'block':'none'
  if (v==='chart') buildPie()
}

function buildPie() {
  if (!chartData.labels.length) return
  if (pieChart) pieChart.destroy()
  const ctx = document.getElementById('pie').getContext('2d')
  pieChart = new Chart(ctx, {
    type:'doughnut',
    data:{
      labels:chartData.labels,
      datasets:[{ data:chartData.counts,
        backgroundColor:COLORS.map(c=>c+'33'),
        borderColor:COLORS,
        borderWidth:1.5
      }]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{position:'right',labels:{color:'#8a9ab5',font:{family:'Share Tech Mono',size:10},boxWidth:10}},
        tooltip:{backgroundColor:'rgba(15,19,24,.95)',titleColor:'#8a9ab5',
          titleFont:{family:'Share Tech Mono',size:10},bodyColor:'#e8edf5',
          bodyFont:{family:'Share Tech Mono',size:11},borderColor:'#1e2d42',borderWidth:1}
      }
    }
  })
}

function renderBars(stats) {
  const max = Math.max(...stats.map(s=>s.count),1)
  document.getElementById('view-bars').innerHTML = stats.map((s,i)=>\`
    <div class="bar-row">
      <div class="bar-name mono">\${s.type}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:\${(s.count/max*100).toFixed(1)}%;background:\${COLORS[i%COLORS.length]}"></div>
      </div>
      <div class="bar-count mono">\${s.count}</div>
    </div>\`).join('')
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type==='UPDATE_DATA' && msg.payload?.statsTypes) {
      const s = msg.payload.statsTypes
      chartData = { labels:s.map(x=>x.type), counts:s.map(x=>x.count) }
      renderBars(s)
      if (pieChart) buildPie()
    }
  } catch(_) {}
})
<\/script></body></html>`
}
