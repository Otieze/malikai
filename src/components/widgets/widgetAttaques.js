import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetAttaques(data = {}) {
  const attaques = data.attaques || []
  const rows = attaques.slice(0, 60).map(a => `
    <div class="row sev-${a.severite}" data-id="${a.id}" onclick="select(${a.id})">
      <div class="row-top">
        <span class="rtype">${a.type}</span>
        <span class="sev-badge ${a.severite}">${a.severite.toUpperCase()}</span>
      </div>
      <div class="rip mono">${a.ip_source} → ${a.appareil}</div>
      <div class="rmeta mono">
        <span>${new Date(a.timestamp).toLocaleTimeString('fr-FR')}</span>
        <span>•</span>
        <span class="rstatut ${a.statut==='BLOQUÉ'?'ok':a.statut==='EN QUARANTAINE'?'crit':''}">${a.statut}</span>
        <span>•</span>
        <span>Conf: ${a.confiance}%</span>
      </div>
    </div>`).join('')

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.badge-count{background:var(--red);color:#fff;border-radius:10px;
  padding:1px 7px;font-size:9px;font-family:var(--mono);font-weight:700}
.filters{padding:8px 16px;display:flex;gap:6px;flex-shrink:0;
  border-bottom:1px solid var(--border);flex-wrap:wrap}
.fbtn{font-size:9px;font-family:var(--mono);letter-spacing:1px;padding:3px 9px;
  border:1px solid var(--border2);background:transparent;color:var(--text3);
  cursor:pointer;border-radius:2px;transition:all .15s}
.fbtn:hover{color:var(--text1)}
.fbtn.active{border-color:var(--cyan);color:var(--cyan);background:var(--cyanbg)}
.list{flex:1;overflow-y:auto}
.row{padding:10px 14px;border-bottom:1px solid var(--border);
  cursor:pointer;transition:background .12s;position:relative;animation:slideIn .2s ease}
.row::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px}
.row:hover{background:var(--bg2)}
.row.selected{background:rgba(0,212,255,.05)}
.row.selected::before,.row.sev-critique.selected::before{background:var(--cyan)}
.row.sev-critique::before{background:var(--red)}
.row.sev-eleve::before  {background:var(--amber)}
.row.sev-moyen::before  {background:var(--blue)}
.row.sev-faible::before {background:var(--green)}
.row-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.rtype{font-size:13px;font-weight:600;color:var(--text1);letter-spacing:.3px}
.rip{font-size:10px;color:var(--text2);margin-top:2px}
.rmeta{display:flex;gap:6px;font-size:9px;color:var(--text3);margin-top:3px;flex-wrap:wrap}
.rstatut.ok{color:var(--green)} .rstatut.crit{color:var(--red)}
.empty{padding:30px;text-align:center;font-family:var(--mono);
  font-size:11px;color:var(--text3);letter-spacing:1px}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Attaques Détectées</span>
  <span class="badge-count" id="count">${attaques.length}</span>
</div>
<div class="filters">
  <button class="fbtn active" onclick="filtrer('',this)">TOUTES</button>
  <button class="fbtn" onclick="filtrer('critique',this)">CRITIQUE</button>
  <button class="fbtn" onclick="filtrer('eleve',this)">ÉLEVÉ</button>
  <button class="fbtn" onclick="filtrer('moyen',this)">MOYEN</button>
</div>
<div class="list" id="list">
  ${rows || '<div class="empty">Aucune attaque détectée</div>'}
</div>
<script>
let allData = ${JSON.stringify(attaques.slice(0,60))}
let filtre = ''
let selectedId = null

function fmt(ts){ return new Date(ts).toLocaleTimeString('fr-FR') }

function render() {
  const data = filtre ? allData.filter(a=>a.severite===filtre) : allData
  document.getElementById('count').textContent = data.length
  document.getElementById('list').innerHTML = data.length ? data.map(a=>\`
    <div class="row sev-\${a.severite}\${a.id===selectedId?' selected':''}" data-id="\${a.id}" onclick="select(\${a.id})">
      <div class="row-top">
        <span class="rtype">\${a.type}</span>
        <span class="sev-badge \${a.severite}">\${a.severite.toUpperCase()}</span>
      </div>
      <div class="rip mono">\${a.ip_source} → \${a.appareil}</div>
      <div class="rmeta mono">
        <span>\${fmt(a.timestamp)}</span><span>•</span>
        <span class="rstatut\${a.statut==='BLOQUÉ'?' ok':a.statut==='EN QUARANTAINE'?' crit':''}">\${a.statut}</span>
        <span>•</span><span>Conf: \${a.confiance}%</span>
      </div>
    </div>\`).join('') : '<div class="empty">Aucune attaque</div>'
}

function select(id) {
  selectedId = id
  render()
  const a = allData.find(x=>x.id===id)
  if (a) toParent({ type:'ATTAQUE_SELECT', payload:a })
}

function filtrer(sev, btn) {
  filtre = sev
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.remove('active'))
  btn.classList.add('active')
  render()
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type === 'UPDATE_DATA' && msg.payload?.attaques) {
      allData = msg.payload.attaques.slice(0,60); render()
    }
  } catch(_) {}
})
<\/script></body></html>`
}
