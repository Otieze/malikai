/**
 * useIframe.js
 * ─────────────────────────────────────────────────────────────
 * Utilitaire pour injecter un widget HTML dans un <iframe srcdoc>
 * et échanger des données via postMessage.
 *
 * Pourquoi des iframes ?
 *  • Isolation CSS totale (chaque widget a son propre contexte de style)
 *  • Isolation JS (Chart.js, libs tierces sans conflit)
 *  • Chaque widget est extractable en page standalone
 *  • Sécurité sandbox configurable
 *
 * Usage dans un composant Vue :
 *   const { iframeRef, send } = useIframe(htmlFn, { onMessage })
 *   send({ type: 'UPDATE_DATA', payload: { ... } })
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * @param {Function} htmlFn  — fonction qui retourne le HTML string complet du widget
 * @param {Object}   opts
 *   opts.onMessage  — callback(event) pour les messages envoyés par l'iframe vers Vue
 *   opts.watchData  — ref Vue à surveiller pour auto-envoyer UPDATE_DATA à l'iframe
 */
export function useIframe(htmlFn, opts = {}) {
  const iframeRef = ref(null)
  let ready = false

  // Injecter le HTML dans l'iframe
  function inject() {
    const el = iframeRef.value
    if (!el) return
    el.srcdoc = htmlFn()
  }

  // Envoyer un message dans l'iframe (après chargement)
  function send(msg) {
    const el = iframeRef.value
    if (!el?.contentWindow) return
    el.contentWindow.postMessage(JSON.stringify(msg), '*')
  }

  // Recevoir les messages de l'iframe
  function onMsg(e) {
    if (!iframeRef.value?.contentWindow) return
    if (e.source !== iframeRef.value.contentWindow) return
    if (opts.onMessage) {
      try { opts.onMessage(typeof e.data === 'string' ? JSON.parse(e.data) : e.data) }
      catch (_) {}
    }
  }

  // Quand l'iframe a fini de charger, envoyer les données initiales
  function onLoad() {
    ready = true
    if (opts.initialData) send({ type: 'UPDATE_DATA', payload: opts.initialData() })
  }

  onMounted(() => {
    inject()
    iframeRef.value?.addEventListener('load', onLoad)
    window.addEventListener('message', onMsg)
  })

  onUnmounted(() => {
    iframeRef.value?.removeEventListener('load', onLoad)
    window.removeEventListener('message', onMsg)
  })

  // Auto-envoyer quand watchData change
  if (opts.watchData) {
    watch(opts.watchData, (val) => {
      if (ready) send({ type: 'UPDATE_DATA', payload: val })
    }, { deep: true })
  }

  // Reconstruire l'iframe entièrement (ex: changement de thème)
  function rebuild() { ready = false; inject() }

  return { iframeRef, send, rebuild }
}

// ─── Token CSS partagés injectés dans chaque iframe ──────────
// Chaque widget reçoit les mêmes variables CSS que l'app parent
export const SHARED_CSS = `
<style>
:root{
  --bg0:#0a0c10;--bg1:#0f1318;--bg2:#141920;--bg3:#1a2130;
  --border:#1e2d42;--border2:#243348;
  --red:#ff3b5c;  --redbg:rgba(255,59,92,.1);
  --amber:#f5a623;--amberbg:rgba(245,166,35,.1);
  --green:#00e5a0;--greenbg:rgba(0,229,160,.1);
  --blue:#2196f3; --bluebg:rgba(33,150,243,.1);
  --cyan:#00d4ff; --cyanbg:rgba(0,212,255,.08);
  --purple:#a855f7;
  --text1:#e8edf5;--text2:#8a9ab5;--text3:#4a5a72;
  --font:'Rajdhani',sans-serif;
  --mono:'Share Tech Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--bg0);color:var(--text1);
  font-family:var(--font);font-size:14px;-webkit-font-smoothing:antialiased;overflow:hidden}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes slideIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.mono{font-family:var(--mono)}
.sev-badge{display:inline-block;font-size:9px;font-family:var(--mono);
  letter-spacing:1px;padding:2px 7px;border-radius:2px;font-weight:700}
.sev-badge.critique{background:var(--redbg);color:var(--red);border:1px solid rgba(255,59,92,.4)}
.sev-badge.eleve   {background:var(--amberbg);color:var(--amber);border:1px solid rgba(245,166,35,.4)}
.sev-badge.moyen   {background:var(--bluebg);color:var(--blue);border:1px solid rgba(33,150,243,.4)}
.sev-badge.faible  {background:var(--greenbg);color:var(--green);border:1px solid rgba(0,229,160,.4)}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--red);
  display:inline-block;animation:pulse 1s ease-in-out infinite}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet"/>
`

// Envoi d'un message vers le parent Vue depuis l'intérieur d'une iframe
export const PARENT_MSG = `
<script>
function toParent(msg){ window.parent.postMessage(JSON.stringify(msg),'*') }
<\/script>`
