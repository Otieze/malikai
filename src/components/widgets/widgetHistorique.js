import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetHistorique(data = {}) {
  const evts = data.historique || []

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.live{font-size:10px;font-family:var(--mono);color:var(--green);letter-spacing:1px;
  display:flex;align-items:center;gap:5px}
.filters{padding:8px 16px;display:flex;gap:6px;border-bottom:1px solid var(--border);
  align-items:center;flex-shrink:0}
.fbtn{font-size:9px;font-family:var(--mono);letter-spacing:1px;padding:3px 9px;
  border:1px solid var(--border2);background:transparent;color:var(--text3);
  cursor:pointer;border-radius:2px;transition:all .15s}
.fbtn.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyanbg)}
.search{flex:1;background:var(--bg2);border:1px solid var(--border2);
  border-radius:2px;padding:4px 10px;font-family:var(--mono);font-size:10px;
  color:var(--text1);letter-spacing:.5px;outline:none}
.search:focus{border-color:var(--cyan)}
.list{flex:1;overflow-y:auto}
.evt{padding:9px 14px;border-bottom:1px solid var(--border);
  display:grid;grid-template-columns:90px 1fr auto;gap:10px;align-items:start}
.etime{font-family:var(--mono);font-size:9px;color:var(--text3);white-space:nowrap;
  letter-spacing:.5px;padding-top:1px}
.emsg{font-family:var(--mono);font-size:10px;color:var(--text2);line-height:1.5}
.emsg .hi{color:var(--cyan)}
.etag{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
.eapp{font-family:var(--mono);font-size:9px;color:var(--text3);white-space:nowrap}
.empty{padding:30px;text-align:center;font-family:var(--mono);font-size:11px;
  color:var(--text3);letter-spacing:1px}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Historique des Événements</span>
  <span class="live"><span class="live-dot"></span> TEMPS RÉEL</span>
</div>
<div class="filters">
  <input class="search" id="search" placeholder="Rechercher IP, type, appareil..." oninput="render()"/>
  <button class="fbtn active" onclick="setFil('',this)">TOUS</button>
  <button class="fbtn" onclick="setFil('critique',this)">CRITIQUE</button>
  <button class="fbtn" onclick="setFil('eleve',this)">ÉLEVÉ</button>
</div>
<div class="list" id="list"></div>
<script>
let allEvts = ${JSON.stringify(evts)}
let filtre = ''

function fmt(ts){
  const d=new Date(ts)
  return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('fr-FR')
}

function render() {
  const q = document.getElementById('search').value.toLowerCase()
  let data = allEvts
  if (filtre) data = data.filter(e=>e.severite===filtre)
  if (q) data = data.filter(e=>(e.message+e.ip_source+e.appareil+e.type).toLowerCase().includes(q))
  document.getElementById('list').innerHTML = data.length
    ? data.slice(0,100).map(e=>\`
      <div class="evt">
        <div class="etime">\${fmt(e.timestamp)}</div>
        <div class="emsg">\${e.message.replace(/(\\d+\\.\\d+\\.\\d+\\.\\d+)/g,'<span class="hi">$1</span>')}</div>
        <div class="etag">
          <span class="sev-badge \${e.severite}">\${e.severite.toUpperCase()}</span>
          <span class="eapp">\${e.appareil??''}</span>
        </div>
      </div>\`).join('')
    : '<div class="empty">Aucun événement</div>'
}

function setFil(sev, btn) {
  filtre=sev
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'))
  btn.classList.add('active')
  render()
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type==='UPDATE_DATA' && msg.payload?.historique) {
      allEvts = msg.payload.historique; render()
    }
  } catch(_) {}
})

render()
<\/script></body></html>`
}
