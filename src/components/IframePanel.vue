<template>
  <!--
    IframePanel : enveloppe un widget HTML dans un <iframe srcdoc>
    • L'iframe est totalement isolée (CSS, JS, scope)
    • La communication passe par postMessage (voir useIframe.js)
    • height  : hauteur CSS du panel (ex: "380px", "100%")
    • htmlFn  : function() => string HTML complet
    • data    : objet réactif envoyé à l'iframe via UPDATE_DATA
    • onMsg   : callback pour les messages remontants (clics, actions...)
  -->
  <div class="iframe-panel" :style="{ height }">
    <iframe
      ref="iframeRef"
      sandbox="allow-scripts allow-same-origin"
      frameborder="0"
      scrolling="no"
      style="width:100%;height:100%;border:none;display:block;border-radius:4px"
    />
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  htmlFn : { type: Function,  required: true },
  data   : { type: Object,    default: () => ({}) },
  height : { type: String,    default: '100%' },
  onMsg  : { type: Function,  default: null },
})

const iframeRef = ref(null)
let loaded = false

// Injecter le HTML dans l'iframe
function inject() {
  if (!iframeRef.value) return
  loaded = false
  iframeRef.value.srcdoc = props.htmlFn(props.data)
}

// Envoyer données dans l'iframe
function send(payload) {
  iframeRef.value?.contentWindow?.postMessage(
    JSON.stringify({ type: 'UPDATE_DATA', payload }), '*'
  )
}

// Recevoir messages de l'iframe
function onWindowMsg(e) {
  if (!iframeRef.value) return
  if (e.source !== iframeRef.value.contentWindow) return
  if (!props.onMsg) return
  try { props.onMsg(typeof e.data === 'string' ? JSON.parse(e.data) : e.data) }
  catch (_) {}
}

// Quand l'iframe a chargé, envoyer données initiales
function onLoad() {
  loaded = true
  send(props.data)
}

onMounted(() => {
  inject()
  iframeRef.value.addEventListener('load', onLoad)
  window.addEventListener('message', onWindowMsg)
})

onUnmounted(() => {
  iframeRef.value?.removeEventListener('load', onLoad)
  window.removeEventListener('message', onWindowMsg)
})

// Ré-envoyer les données quand elles changent
watch(
  () => props.data,
  (val) => { if (loaded) send(val) },
  { deep: true }
)

// Exposer rebuild pour forcer une réinjection
defineExpose({
  rebuild: inject,
  send,
})
</script>

<style scoped>
.iframe-panel {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg1);
}
</style>
