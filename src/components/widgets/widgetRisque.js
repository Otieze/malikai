import { SHARED_CSS, PARENT_MSG } from '@/composables/useIframe'

export function widgetRisque(data = {}) {
  const m = data.metriques || {}
  const score = m.score_risque ?? 0
  const niveau = m.niveau_risque ?? 'N/A'
  const sevCls = score>=80?'critique':score>=60?'eleve':score>=40?'moyen':'faible'
  const arcColor = score>=80?'#ff3b5c':score>=60?'#f5a623':score>=40?'#2196f3':'#00e5a0'
  // Arc SVG demi-cercle : dasharray=201, offset = 201*(1-score/100)
  const offset = (201*(1-score/100)).toFixed(1)

  const kpis = [
    { label:'Attaques/jour', val:m.attaques_jour??'—', color:'var(--red)' },
    { label:'Bloquées',      val:m.bloquees??'—',      color:'var(--amber)' },
    { label:'IPs uniques',   val:m.ips_uniques??'—',   color:'var(--blue)' },
    { label:'Disponibilité', val:m.uptime?(m.uptime+'%'):'—', color:'var(--green)' },
  ]

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>${SHARED_CSS}
<style>
body{overflow:hidden;height:100vh;display:flex;flex-direction:column}
.top{padding:11px 16px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.ptitle{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text2);
  text-transform:uppercase;font-family:var(--mono)}
.risk-body{flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:14px;gap:10px}
.arc-wrap{position:relative;width:160px;height:90px}
.arc-wrap svg{overflow:visible}
.risk-val{position:absolute;bottom:0;left:50%;transform:translateX(-50%);text-align:center}
.rnum{font-size:40px;font-weight:700;font-family:var(--mono);line-height:1}
.rlbl{font-size:10px;font-family:var(--mono);color:var(--text3);letter-spacing:2px}
.rticks{display:flex;justify-content:space-between;width:160px;
  font-family:var(--mono);font-size:9px;color:var(--text3)}
.badge{padding:4px 18px;border-radius:3px;font-size:11px;
  font-weight:700;letter-spacing:2px;font-family:var(--mono)}
.badge.critique{background:var(--redbg);border:1px solid var(--red);color:var(--red)}
.badge.eleve   {background:var(--amberbg);border:1px solid var(--amber);color:var(--amber)}
.badge.moyen   {background:var(--bluebg);border:1px solid var(--blue);color:var(--blue)}
.badge.faible  {background:var(--greenbg);border:1px solid var(--green);color:var(--green)}
.kpi-grid{display:grid;grid-template-columns:1fr 1fr;
  border-top:1px solid var(--border);background:var(--border)}
.kpi{background:var(--bg1);padding:11px 14px}
.knum{font-size:22px;font-weight:700;font-family:var(--mono);line-height:1}
.klbl{font-size:9px;color:var(--text2);letter-spacing:1.5px;
  text-transform:uppercase;font-family:var(--mono);margin-top:3px}
.ia-row{padding:10px 16px;border-top:1px solid var(--border);
  display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ia-cell{text-align:center}
.ia-val{font-size:15px;font-weight:700;font-family:var(--mono);color:var(--cyan)}
.ia-lbl{font-size:9px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;margin-top:2px}
</style></head><body>
${PARENT_MSG}
<div class="top">
  <span class="ptitle">Niveau de Risque</span>
  <span class="sev-badge ${sevCls}">${sevCls.toUpperCase()}</span>
</div>
<div class="risk-body">
  <div class="arc-wrap">
    <svg width="160" height="90" viewBox="0 0 160 90">
      <path d="M16 87 A64 64 0 0 1 144 87"
        fill="none" stroke="var(--border2)" stroke-width="10" stroke-linecap="round"/>
      <path id="arc" d="M16 87 A64 64 0 0 1 144 87"
        fill="none" stroke="${arcColor}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="201" stroke-dashoffset="${offset}"
        style="transition:stroke-dashoffset 1s ease"/>
    </svg>
    <div class="risk-val">
      <div class="rnum" id="rnum" style="color:${arcColor}">${score}</div>
      <div class="rlbl">/ 100</div>
    </div>
  </div>
  <div class="rticks"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
  <div class="badge ${sevCls}">${niveau}</div>
  <div style="font-size:10px;font-family:var(--mono);color:var(--text3);text-align:center;line-height:1.7">
    Basé sur la fréquence,<br>sévérité &amp; exposition réseau
  </div>
</div>
<div class="kpi-grid">
  ${kpis.map(k=>`<div class="kpi">
    <div class="knum" style="color:${k.color}">${k.val}</div>
    <div class="klbl">${k.label}</div>
  </div>`).join('')}
</div>
<div class="ia-row">
  <div class="ia-cell"><div class="ia-val">${m.precision??'—'}</div><div class="ia-lbl">PRÉCISION</div></div>
  <div class="ia-cell"><div class="ia-val">${m.rappel??'—'}</div><div class="ia-lbl">RAPPEL</div></div>
  <div class="ia-cell"><div class="ia-val">${m.f1??'—'}</div><div class="ia-lbl">F1 SCORE</div></div>
</div>
<script>
window.addEventListener('message', e => {
  try {
    const msg = JSON.parse(e.data)
    if (msg.type !== 'UPDATE_DATA') return
    const m = msg.payload?.metriques || {}
    const s = m.score_risque ?? 0
    const col = s>=80?'#ff3b5c':s>=60?'#f5a623':s>=40?'#2196f3':'#00e5a0'
    document.getElementById('rnum').textContent = s
    document.getElementById('rnum').style.color = col
    document.getElementById('arc').style.stroke = col
    document.getElementById('arc').setAttribute('stroke-dashoffset',(201*(1-s/100)).toFixed(1))
  } catch(_) {}
})
<\/script>
</body></html>`
}
