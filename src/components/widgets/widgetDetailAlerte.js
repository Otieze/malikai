import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetDetailAlerte(data = {}) {
  const a = data.alerteSelectee || null

  function renderAlerte(a) {
    if (!a) return `<div class="empty mono">Sélectionnez une attaque<br>dans la liste</div>`
    const sc = a.statut==='BLOQUÉ'?'var(--green)':a.statut==='EN QUARANTAINE'?'var(--red)':'var(--amber)'
    return `
    <div class="field"><div class="fkey">Type d'Attaque</div>
      <div class="fval highlight" style="font-size:15px;font-weight:700">${a.type}</div></div>
    <div class="field"><div class="fkey">Sévérité</div>
      <div><span class="sev-badge ${a.severite}">${a.severite.toUpperCase()}</span></div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">IP Source</div>
      <div class="fval mono" style="color:var(--red)">${a.ip_source}</div></div>
    <div class="field"><div class="fkey">Cible</div>
      <div class="fval mono" style="color:var(--cyan)">${a.ip_dest} : ${a.port}</div></div>
    <div class="field"><div class="fkey">Appareil IoT</div>
      <div class="fval mono" style="color:var(--amber)">${a.appareil}</div></div>
    <div class="field"><div class="fkey">Protocole</div>
      <div class="fval mono">${a.protocole}</div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">Horodatage</div>
      <div class="fval mono">${new Date(a.timestamp).toLocaleString('fr-FR')}</div></div>
    <div class="field"><div class="fkey">Statut</div>
      <div class="fval mono" style="color:${sc}">${a.statut}</div></div>
    <div class="field"><div class="fkey">Confiance IA</div>
      <div class="fval mono" style="color:var(--green)">${a.confiance}%</div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">Méthode / Chemin</div>
      <div class="fval mono" style="color:var(--amber)">${a.details?.methode??'—'}</div></div>
    <div class="field"><div class="fkey">Modèle IA</div>
      <div class="fval mono" style="color:var(--cyan)">${a.details?.modele??'—'}</div></div>
    <div class="field"><div class="fkey">Score d'Anomalie</div>
      <div class="fval mono" style="color:var(--red)">${a.details?.score_anomalie??'—'}</div></div>
    <div class="field"><div class="fkey">Features IA</div>
      <div class="payload">${a.details?.features?
        `Débit: ${a.details.features.debit} paq/s | Durée: ${a.details.features.duree_ms}ms | Taille moy: ${a.details.features.taille_moy}B`
        :'—'}</div></div>
    <div class="field"><div class="fkey">Payload / Signature</div>
      <div class="payload">${a.details?.payload??'—'}</div></div>`
  }

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{height:100vh;display:flex;flex-direction:column;overflow:hidden}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.content{flex:1;overflow-y:auto;padding:14px}
.field{margin-bottom:11px}
.fkey{font-size:9px;font-family:var(--mono);color:var(--text3);
  letter-spacing:2px;text-transform:uppercase;margin-bottom:3px}
.fval{font-size:12px;font-family:var(--mono);color:var(--text1);word-break:break-all;line-height:1.5}
.highlight{color:var(--red)}
.divider{height:1px;background:var(--border);margin:10px 0}
.payload{background:var(--bg0);border:1px solid var(--border);border-radius:3px;
  padding:9px;font-size:10px;font-family:var(--mono);color:var(--text2);
  line-height:1.7;word-break:break-all;max-height:90px;overflow-y:auto}
.actions{padding:12px 14px;border-top:1px solid var(--border);
  display:flex;flex-direction:column;gap:6px;flex-shrink:0}
.btn-action{padding:8px 12px;border-radius:3px;font-size:11px;
  font-family:var(--mono);letter-spacing:1px;cursor:pointer;
  border:1px solid;transition:all .15s;font-weight:600;width:100%;text-align:left}
.btn-block {background:var(--redbg);border-color:rgba(255,59,92,.5);color:var(--red)}
.btn-block:hover{background:rgba(255,59,92,.18)}
.btn-invest{background:var(--amberbg);border-color:rgba(245,166,35,.5);color:var(--amber)}
.btn-dismiss{background:var(--bg2);border-color:var(--border2);color:var(--text2)}
.empty{height:100%;display:flex;align-items:center;justify-content:center;
  text-align:center;font-size:11px;color:var(--text3);letter-spacing:1px;line-height:2}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Détail de l'Alerte</span>
  <span class="live-dot"></span>
</div>
<div class="content" id="content">${renderAlerte(a)}</div>
<div class="actions">
  <button class="btn-action btn-block"   onclick="action('BLOQUER')">⛔ BLOQUER L'IP SOURCE</button>
  <button class="btn-action btn-invest"  onclick="action('ENQUETER')">🔍 ENQUÊTE APPROFONDIE</button>
  <button class="btn-action btn-dismiss" onclick="action('IGNORER')">✓ IGNORER L'ALERTE</button>
</div>
<script>
let currentAttaque = ${JSON.stringify(a)}

function fmt(ts){ return new Date(ts).toLocaleString('fr-FR') }

function render(a) {
  if (!a) { document.getElementById('content').innerHTML='<div class="empty mono">Sélectionnez une attaque<br>dans la liste</div>'; return }
  const sc = a.statut==='BLOQUÉ'?'var(--green)':a.statut==='EN QUARANTAINE'?'var(--red)':'var(--amber)'
  document.getElementById('content').innerHTML = \`
    <div class="field"><div class="fkey">Type d'Attaque</div>
      <div class="fval highlight" style="font-size:15px;font-weight:700">\${a.type}</div></div>
    <div class="field"><div class="fkey">Sévérité</div>
      <div><span class="sev-badge \${a.severite}">\${a.severite.toUpperCase()}</span></div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">IP Source</div>
      <div class="fval mono" style="color:var(--red)">\${a.ip_source}</div></div>
    <div class="field"><div class="fkey">Cible</div>
      <div class="fval mono" style="color:var(--cyan)">\${a.ip_dest} : \${a.port}</div></div>
    <div class="field"><div class="fkey">Appareil IoT</div>
      <div class="fval mono" style="color:var(--amber)">\${a.appareil}</div></div>
    <div class="field"><div class="fkey">Protocole</div>
      <div class="fval mono">\${a.protocole}</div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">Horodatage</div>
      <div class="fval mono">\${fmt(a.timestamp)}</div></div>
    <div class="field"><div class="fkey">Statut</div>
      <div class="fval mono" style="color:\${sc}">\${a.statut}</div></div>
    <div class="field"><div class="fkey">Confiance IA</div>
      <div class="fval mono" style="color:var(--green)">\${a.confiance}%</div></div>
    <div class="divider"></div>
    <div class="field"><div class="fkey">Score d'Anomalie</div>
      <div class="fval mono" style="color:var(--red)">\${a.details?.score_anomalie??'—'}</div></div>
    <div class="field"><div class="fkey">Modèle IA</div>
      <div class="fval mono" style="color:var(--cyan)">\${a.details?.modele??'—'}</div></div>
    <div class="field"><div class="fkey">Méthode</div>
      <div class="fval mono" style="color:var(--amber)">\${a.details?.methode??'—'}</div></div>
    <div class="field"><div class="fkey">Payload / Signature</div>
      <div class="payload">\${a.details?.payload??'—'}</div></div>\`
}

function action(type) {
  if (currentAttaque) toParent({ type:'ALERTE_ACTION', payload:{ action:type, id:currentAttaque.id } })
}

window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type==='UPDATE_DATA' && 'alerteSelectee' in msg.payload) {
      currentAttaque = msg.payload.alerteSelectee; render(currentAttaque)
    }
    if (msg.type==='ATTAQUE_SELECT') { currentAttaque=msg.payload; render(currentAttaque) }
  } catch(_) {}
})
<\/script></body></html>`
}
