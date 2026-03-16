import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, creerFluxTempsReel } from '@/services/api'

export const useSentinelStore = defineStore('sentinel', () => {
  const metriques       = ref(null)
  const attaques        = ref([])
  const alerteSelectee  = ref(null)
  const statsTypes      = ref([])
  const historique      = ref([])
  const appareils       = ref([])
  const connexion       = ref(false)
  const chargement      = ref(false)
  const notifications   = ref([])
  let   _ws             = null

  const critiques = computed(()=> attaques.value.filter(a=>a.severite==='critique'))
  const nonLues   = computed(()=> notifications.value.filter(n=>!n.lu).length)

  const niveauRisque = computed(()=>{
    const s = metriques.value?.score_risque ?? 0
    if (s>=80) return { label:'CRITIQUE', cls:'critique', color:'#ff3b5c' }
    if (s>=60) return { label:'ÉLEVÉ',    cls:'eleve',    color:'#f5a623' }
    if (s>=40) return { label:'MOYEN',    cls:'moyen',    color:'#2196f3' }
    return             { label:'FAIBLE',  cls:'faible',   color:'#00e5a0' }
  })

  async function init() {
    chargement.value = true
    try {
      const [m,a,s,h,app] = await Promise.all([
        api.getMetriques(), api.getAttaques(),
        api.getStatsTypes(), api.getHistorique(), api.getAppareils()
      ])
      metriques.value  = m
      attaques.value   = a.data
      statsTypes.value = s
      historique.value = h.data
      appareils.value  = app
    } finally { chargement.value = false }
  }

  function demarrer() {
    if (_ws) return
    _ws = creerFluxTempsReel(evt => {
      if (evt.type === 'nouvelle_attaque') {
        attaques.value.unshift(evt.data)
        if (attaques.value.length > 200) attaques.value.pop()
        historique.value.unshift({
          id: Date.now(), timestamp: new Date().toISOString(),
          type: evt.data.type, severite: evt.data.severite,
          ip_source: evt.data.ip_source, appareil: evt.data.appareil,
          statut: evt.data.statut,
          message:`${evt.data.type} détecté depuis ${evt.data.ip_source}`
        })
        if (metriques.value) metriques.value.attaques_jour++
        notifications.value.unshift({ id:Date.now(), message:`${evt.data.type} — ${evt.data.ip_source}`, severite:evt.data.severite, lu:false })
        if (notifications.value.length>60) notifications.value.pop()
      }
    })
    connexion.value = true
  }

  function arreter() { _ws?.close(); _ws=null; connexion.value=false }

  function selectionner(a) { alerteSelectee.value = a }

  async function bloquerIP(id) {
    await api.bloquerIP(id)
    const a = attaques.value.find(x=>x.id===id)
    if (a) a.statut = 'BLOQUÉ'
  }

  async function ignorer(id) {
    await api.ignorerAlerte(id)
    attaques.value = attaques.value.filter(a=>a.id!==id)
    if (alerteSelectee.value?.id===id) alerteSelectee.value=null
  }

  function marquerLu() { notifications.value.forEach(n=>{ n.lu=true }) }

  return {
    metriques, attaques, alerteSelectee, statsTypes, historique, appareils,
    connexion, chargement, notifications, critiques, nonLues, niveauRisque,
    init, demarrer, arreter, selectionner, bloquerIP, ignorer, marquerLu
  }
})
