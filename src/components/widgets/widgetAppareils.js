import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetAppareils(data = {}) {
  const appareils = data.appareils || []
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.count-badge{background:var(--cyanbg);border:1px solid rgba(0,212,255,.3);
  border-radius:3px;padding:2px 8px;font-size:10px;font-family:var(--mono);color:var(--cyan)}
.list{flex:1;overflow-y:auto}
.item{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:12px;transition:background .12s}
.item:hover{background:var(--bg2)}
.status-ring{width:32px;height:32px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px}
.status-ring.online  {background:rgba(0,229,160,.12);border:1px solid rgba(0,229,160,.4)}
.status-ring.alerte  {background:rgba(245,166,35,.12);border:1px solid rgba(245,166,35,.4)}
.status-ring.offline {background:rgba(74,90,114,.12); border:1px solid rgba(74,90,114,.4)}
.info{flex:1;min-width:0}
.iname{font-size:13px;font-weight:600;color:var(--text1);letter-spacing:.3px}
.iip  {font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:2px}
.right{text-align:right;flex-shrink:0}
.statut-lbl{font-size:9px;font-family:var(--mono);letter-spacing:1px}
.statut-lbl.online {color:var(--green)}
.statut-lbl.alerte {color:var(--amber)}
.statut-lbl.offline{color:var(--text3)}
.atk-count{font-size:11px;font-family:var(--mono);color:var(--text2);margin-top:3px}
.atk-count.has{color:var(--red)}
.summary{padding:10px 16px;border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(3,1fr);gap:1px;
  background:var(--border);flex-shrink:0}
.ssum{background:var(--bg1);padding:9px;text-align:center}
.sval{font-size:18px;font-weight:700;font-family:var(--mono)}
.slbl{font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;margin-top:2px}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Appareils IoT</span>
  <span class="count-badge" id="cnt">${appareils.length} CONNECTÉS</span>
</div>
<div class="list" id="list"></div>
<div class="summary">
  <div class="ssum"><div class="sval" id="s-on" style="color:var(--green)">0</div><div class="slbl">EN LIGNE</div></div>
  <div class="ssum"><div class="sval" id="s-al" style="color:var(--amber)">0</div><div class="slbl">ALERTE</div></div>
  <div class="ssum"><div class="sval" id="s-of" style="color:var(--text3)">0</div><div class="slbl">HORS LIGNE</div></div>
</div>
<script>
let data = ${JSON.stringify(appareils)}

const ICONS = {'ESP32':'🔌','Capteur':'🌡️','Caméra':'📷','Thermostat':'🌡','Hub':'📡','Passerelle':'🔗'}
function icon(nom){ return Object.entries(ICONS).find(([k])=>nom.startsWith(k))?.[1]??'📟' }
function cls(s){ return s==='EN LIGNE'?'online':s==='ALERTE'?'alerte':'offline' }

function render() {
  const on = data.filter(d=>d.statut==='EN LIGNE').length
  const al = data.filter(d=>d.statut==='ALERTE').length
  const of = data.filter(d=>d.statut==='HORS LIGNE').length
  document.getElementById('s-on').textContent = on
  document.getElementById('s-al').textContent = al
  document.getElementById('s-of').textContent = of
  document.getElementById('cnt').textContent  = data.length+' CONNECTÉS'
  document.getElementById('list').innerHTML = data.map(d=>\`
    <div class="item">
      <div class="status-ring \${cls(d.statut)}">\${icon(d.nom)}</div>
      <div class="info">
        <div class="iname">\${d.nom}</div>
        <div class="iip">\${d.ip}</div>
      </div>
      <div class="right">
        <div class="statut-lbl \${cls(d.statut)}">\${d.statut}</div>
        <div class="atk-count \${d.attaques>0?'has':''}">\${d.attaques} attaques</div>
      </div>
    </div>\`).join('')
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type==='UPDATE_DATA' && msg.payload?.appareils) {
      data=msg.payload.appareils; render()
    }
  } catch(_) {}
})

render()
<\/script></body></html>`
}
