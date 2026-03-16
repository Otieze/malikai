/**
 * services/api.js
 * ─────────────────────────────────────────────────────────────
 * Couche d'abstraction entre le frontend et le backend.
 *
 * PASSER EN MODE RÉEL :
 *   1. Mettre USE_MOCK = false
 *   2. Décommenter le proxy dans vite.config.js
 *   3. Toutes les fonctions retournent la même structure — aucun
 *      changement dans les composants nécessaire.
 *
 * FORMAT ATTENDU DU BACKEND (FastAPI/Flask) :
 *   GET  /api/v1/metriques        → ObjetMetriques
 *   GET  /api/v1/attaques         → { data: [], total, page }
 *   GET  /api/v1/attaques/:id     → ObjetAttaque
 *   GET  /api/v1/trafic?periode=  → { labels, normal, attaque }
 *   GET  /api/v1/stats/types      → [{ type, count }]
 *   GET  /api/v1/historique       → { data: [], total }
 *   GET  /api/v1/appareils        → [ObjetAppareil]
 *   POST /api/v1/attaques/:id/bloquer
 *   DELETE /api/v1/attaques/:id
 *   POST /api/v1/rapport
 *   WS   /ws/alertes              → messages JSON temps réel
 */

import axios from 'axios'

const USE_MOCK = true          // ← false quand backend prêt
const BASE_URL = '/api/v1'

const http = axios.create({ baseURL: BASE_URL, timeout: 10000 })

// Token JWT pour auth — déjà prêt pour le backend
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('sentinel_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
http.interceptors.response.use(r => r.data, err =>
  Promise.reject(err?.response?.data ?? err.message)
)

// ─── Générateurs de données mock ────────────────────────────
const TYPES = ['Injection SQL','DoS/DDoS','Man-in-the-Middle','Brute Force',
               'Scan de Ports','Botnet IoT','Injection Paquets','Exploit CVE']
const APPAREILS = ['ESP32-Salon','Capteur-Temp-01','Caméra-Entrée',
                   'Thermostat-Smart','Hub-Zigbee','Passerelle-MQTT']
const PROTO = ['TCP','UDP','MQTT','CoAP','HTTP','HTTPS']
const STATUTS = ['BLOQUÉ','ATTÉNUÉ','DÉTECTÉ','EN QUARANTAINE']

const r  = (a,b)  => Math.floor(Math.random()*(b-a+1))+a
const ri = arr    => arr[r(0,arr.length-1)]
const ip = ()     => `${r(1,254)}.${r(1,254)}.${r(1,254)}.${r(1,254)}`

const SEV_MAP = {
  'Injection SQL':'critique','DoS/DDoS':'critique','Botnet IoT':'critique','Exploit CVE':'critique',
  'Man-in-the-Middle':'eleve','Brute Force':'eleve','Injection Paquets':'eleve',
  'Scan de Ports':'moyen'
}

let _id = 1
function mkAttaque() {
  const type = ri(TYPES)
  return {
    id: _id++, type, severite: SEV_MAP[type] ?? 'moyen',
    ip_source: ip(), ip_dest: `192.168.1.${r(1,50)}`,
    port: ri([22,80,443,1883,5683,3306,8080,8883]),
    protocole: ri(PROTO), appareil: ri(APPAREILS),
    statut: ri(STATUTS),
    timestamp: new Date(Date.now() - r(0, 3600000)).toISOString(),
    confiance: r(78,99),
    details: {
      methode: `${ri(['GET','POST','TCP SYN','UDP FLOOD','SUBSCRIBE'])} ${ri(['/api/cmd','/admin','/mqtt','/coap/data'])}`,
      payload: `${r(64,65535)} octets — sig: ${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      features: { debit: r(100,50000), duree_ms: r(10,5000), taille_moy: r(40,1500) },
      modele: 'Random Forest v2.4',
      score_anomalie: (0.7 + Math.random()*0.3).toFixed(3),
    }
  }
}

let _mockList = Array.from({length:14}, mkAttaque)

function mkTrafic(pts) {
  const labels=[], normal=[], attaque=[]
  const spike = r(Math.floor(pts*.2), Math.floor(pts*.7))
  for (let i=pts;i>=0;i--) {
    const t = new Date(Date.now()-i*60000)
    labels.push(t.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}))
    normal.push(r(400,900))
    attaque.push(i>spike&&i<spike+7 ? r(1500,4500) : r(0,100))
  }
  return { labels, normal, attaque }
}

function mkMetriques() {
  const s = r(55,92)
  return {
    score_risque: s,
    niveau_risque: s>=80?'CRITIQUE':s>=60?'ÉLEVÉ':s>=40?'MOYEN':'FAIBLE',
    attaques_jour: r(30,80), bloquees: r(20,70),
    ips_uniques: r(8,25), uptime: (99+Math.random()*.9).toFixed(1),
    appareils_actifs: r(4,12),
    precision: (0.94+Math.random()*.05).toFixed(3),
    rappel:    (0.91+Math.random()*.07).toFixed(3),
    f1:        (0.92+Math.random()*.06).toFixed(3),
    accuracy:  (0.93+Math.random()*.06).toFixed(3),
  }
}

function mkHistorique(n=40) {
  return Array.from({length:n}, (_,i) => {
    const a = mkAttaque()
    return {
      id: 9000+i, timestamp: new Date(Date.now()-r(0,86400000*7)).toISOString(),
      type: a.type, severite: a.severite, ip_source: a.ip_source,
      appareil: a.appareil, statut: a.statut,
      message: `${a.type} détecté depuis ${a.ip_source} → ${a.appareil}`
    }
  }).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp))
}

// ─── API publique ────────────────────────────────────────────
export const api = {
  async getMetriques() {
    if (USE_MOCK) return mkMetriques()
    return http.get('/metriques')
  },
  async getAttaques({ page=1, limite=50, severite=null }={}) {
    if (USE_MOCK) {
      let d = [..._mockList]
      if (severite) d = d.filter(a=>a.severite===severite)
      return { data: d, total: d.length }
    }
    return http.get('/attaques', { params:{page,limite,severite} })
  },
  async getAttaque(id) {
    if (USE_MOCK) return _mockList.find(a=>a.id===id)??null
    return http.get(`/attaques/${id}`)
  },
  async getTrafic({ periode='1h' }={}) {
    if (USE_MOCK) return mkTrafic({'1h':60,'6h':72,'24h':96}[periode]??60)
    return http.get('/trafic',{params:{periode}})
  },
  async getStatsTypes() {
    if (USE_MOCK) return TYPES.map(t=>({type:t,count:r(1,42)})).sort((a,b)=>b.count-a.count)
    return http.get('/stats/types')
  },
  async getHistorique({ page=1, limite=100 }={}) {
    if (USE_MOCK) return { data: mkHistorique(50), total:50 }
    return http.get('/historique',{params:{page,limite}})
  },
  async getAppareils() {
    if (USE_MOCK) return APPAREILS.map(nom=>({
      nom, ip:`192.168.1.${r(2,50)}`,
      statut: ri(['EN LIGNE','EN LIGNE','EN LIGNE','ALERTE','HORS LIGNE']),
      attaques: r(0,15),
      derniere_activite: new Date(Date.now()-r(0,600000)).toISOString()
    }))
    return http.get('/appareils')
  },
  async bloquerIP(id) {
    if (USE_MOCK) { const a=_mockList.find(x=>x.id===id); if(a) a.statut='BLOQUÉ'; return {ok:true} }
    return http.post(`/attaques/${id}/bloquer`)
  },
  async ignorerAlerte(id) {
    if (USE_MOCK) { _mockList=_mockList.filter(a=>a.id!==id); return {ok:true} }
    return http.delete(`/attaques/${id}`)
  },
  async genererRapport(params={}) {
    if (USE_MOCK) return { message:'Rapport simulé (PDF réel avec backend)', url:'#' }
    return http.post('/rapport', params)
  },
}

// ─── Flux WebSocket temps réel ────────────────────────────────
export function creerFluxTempsReel(onMessage) {
  if (USE_MOCK) {
    const iv = setInterval(()=>{
      if (Math.random() > 0.5) return
      const a = mkAttaque()
      _mockList.unshift(a)
      if (_mockList.length>200) _mockList.pop()
      onMessage({ type:'nouvelle_attaque', data:a })
    }, 2800)
    return { close: ()=>clearInterval(iv) }
  }
  // Vrai WebSocket
  const proto = location.protocol==='https:'?'wss':'ws'
  const ws = new WebSocket(`${proto}://${location.host}/ws/alertes`)
  ws.onmessage = e => { try { onMessage(JSON.parse(e.data)) } catch(_){} }
  ws.onerror   = e => console.error('[WS]',e)
  return ws
}
