<template>
  <div class="p-6 md:p-8 max-w-6xl mx-auto">
    <!-- Top -->
    <div class="mb-6 flex items-center justify-between gap-4">
      <button
        @click="$router.push('/mensajes')"
        class="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors group"
      >
        <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span>
        Volver a mensajes
      </button>

      <button
        @click="refreshAll()"
        :disabled="loading"
        class="px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em]
               bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
      >
        🔄 Actualizar
      </button>
    </div>

    <!-- Header conversation -->
    <div
      class="relative overflow-hidden rounded-[2.5rem] border border-white shadow-[0_20px_70px_-15px_rgba(30,58,138,0.15)] mb-6"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950"></div>
      <div class="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>

      <div class="relative z-10 p-8 md:p-9 flex items-center justify-between gap-5">
        <div class="flex items-center gap-4">
          <div
            class="h-12 w-12 rounded-[1.5rem] bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white font-black"
          >
            {{ initials(title) }}
          </div>
          <div>
            <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
              Chat
            </p>
            <h1 class="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
              {{ title }}
            </h1>
            <p class="text-blue-100/60 text-[11px] font-bold mt-1">
              Mensajes internos del sistema
            </p>
          </div>
        </div>

        <div
          class="hidden md:flex items-center gap-2 bg-white/10 border border-white/10 rounded-[1.5rem] px-4 py-3 backdrop-blur-md"
        >
          <span class="text-[10px] font-black uppercase tracking-widest text-blue-200/70">Polling</span>
          <span class="text-[10px] font-black uppercase tracking-widest text-white/80">
            {{ polling ? "ON" : "OFF" }}
          </span>
        </div>
      </div>

      <div class="relative z-10 px-10 pb-6">
        <div class="h-px bg-white/10"></div>
      </div>
    </div>

    <!-- Chat box -->
    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <!-- messages -->
      <div ref="scrollRef" @scroll="onScroll" class="p-8 h-[60vh] overflow-y-auto custom-scrollbar bg-white">
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 6" :key="i" class="animate-pulse">
            <div class="h-4 w-48 bg-slate-200 rounded mb-2"></div>
            <div class="h-10 w-full bg-slate-100 rounded-2xl"></div>
          </div>
        </div>

        <button
          v-if="hasNewWhileUp"
          @click="scrollToBottom()"
          class="fixed bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl
                 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl"
        >
          Nuevos mensajes ↓
        </button>

        <div v-else-if="messages.length === 0" class="text-center py-20">
          <div class="text-4xl mb-3">🗨️</div>
          <p class="text-slate-600 font-bold">Todavía no hay mensajes.</p>
          <p class="text-[11px] text-slate-400 mt-2">Escribí el primero para iniciar la conversación.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="m in messages" :key="m.id" class="flex" :class="isMine(m) ? 'justify-end' : 'justify-start'">
            <div class="max-w-[78%]">
              <p
                v-if="!isMine(m)"
                class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-2"
              >
                {{ m.sender?.name || "Médico" }}
              </p>

              <div
                class="rounded-[1.75rem] px-5 py-4 border shadow-sm"
                :class="
                  isMine(m)
                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                    : 'bg-slate-50 text-slate-800 border-slate-100'
                "
              >
                <!-- Texto -->
                <p v-if="m.body" class="font-bold text-sm leading-relaxed whitespace-pre-wrap">
                  {{ m.body }}
                </p>

                <!-- Adjuntos -->
                <div v-if="(m.attachments?.length || 0) > 0" class="mt-3 space-y-2">
                  <template v-for="a in m.attachments" :key="a.id">
                    <!-- IMAGEN: thumbnail chico + click abre lightbox -->
                    <button
                      v-if="isImage(a)"
                      type="button"
                      @click="openLightbox(a)"
                      class="block text-left w-fit max-w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:opacity-95 transition"
                    >
                      <img
                        :src="fileAbsoluteUrl(a)"
                        :alt="a.original_name || 'imagen'"
                        class="thumb-img"
                        loading="lazy"
                      />
                      <div
                        class="px-3 py-2 flex items-center justify-between gap-3"
                        :class="isMine(m) ? 'text-white/80' : 'text-slate-500'"
                      >
                        <span class="text-[10px] font-black truncate max-w-[240px]">
                          {{ a.original_name || "Imagen" }}
                        </span>
                        <span class="text-[10px] font-black uppercase tracking-widest opacity-80">
                          {{ prettySize(a.size) }}
                        </span>
                      </div>
                    </button>

                    <!-- PDF: preview compacto + click abre modal -->
                    <button
                      v-else-if="isPdf(a)"
                      type="button"
                      @click="openPdf(a)"
                      class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border
                             hover:opacity-95 transition"
                      :class="
                        isMine(m)
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      "
                    >
                      <div class="min-w-0 flex items-center gap-3">
                        <div
                          class="h-10 w-10 rounded-2xl flex items-center justify-center font-black"
                          :class="isMine(m) ? 'bg-white/15' : 'bg-slate-100 text-slate-700'"
                        >
                          PDF
                        </div>
                        <div class="min-w-0">
                          <p class="text-[11px] font-black truncate">
                            {{ a.original_name || "Documento.pdf" }}
                          </p>
                          <p class="text-[10px] font-bold opacity-70">
                            {{ prettySize(a.size) }}
                          </p>
                        </div>
                      </div>

                      <span class="text-[10px] font-black uppercase tracking-widest opacity-80">
                        Ver
                      </span>
                    </button>

                    <!-- Otros archivos -->
                    <a
                      v-else
                      :href="fileAbsoluteUrl(a)"
                      target="_blank"
                      rel="noreferrer"
                      class="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border hover:opacity-95 transition"
                      :class="
                        isMine(m)
                          ? 'border-white/15 bg-white/10 text-white'
                          : 'border-slate-200 bg-white text-slate-700'
                      "
                    >
                      <div class="min-w-0">
                        <p class="text-[11px] font-black truncate">📎 {{ a.original_name || "Archivo" }}</p>
                        <p class="text-[10px] font-bold opacity-70">
                          {{ a.mime_type || "file" }} • {{ prettySize(a.size) }}
                        </p>
                      </div>
                      <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Abrir</span>
                    </a>
                  </template>
                </div>

                <div class="mt-2 flex justify-end">
                  <span
                    class="text-[10px] font-black uppercase tracking-widest"
                    :class="isMine(m) ? 'text-white/70' : 'text-slate-400'"
                  >
                    {{ timeOnly(m.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- composer -->
      <div class="p-6 border-t border-slate-100 bg-slate-50/50">
        <div class="flex gap-3 items-end">
          <!-- input file oculto -->
          <input ref="fileRef" type="file" class="hidden" multiple @change="onFiles" />

          <textarea
            v-model="draft"
            rows="1"
            placeholder="Escribí un mensaje..."
            class="flex-1 resize-none px-5 py-4 bg-white border border-slate-200 rounded-2xl
                   focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none
                   font-bold text-sm transition-all"
            @keydown.enter.exact.prevent="send()"
          ></textarea>

          <!-- botón adjuntar -->
          <button
            type="button"
            @click="fileRef?.click()"
            class="px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em]
                   bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all"
          >
            📎
          </button>

          <button
            @click="send()"
            :disabled="sending || (!draft.trim() && pickedFiles.length === 0)"
            class="px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em]
                   bg-emerald-600 text-white shadow-xl shadow-emerald-100
                   hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-30"
          >
            {{ sending ? "Enviando..." : "Enviar" }}
          </button>
        </div>

        <!-- chips de archivos elegidos -->
        <div v-if="pickedFiles.length" class="mt-3 flex flex-wrap gap-2">
          <div
            v-for="(f, idx) in pickedFiles"
            :key="idx"
            class="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-2"
          >
            <span class="truncate max-w-[220px]">{{ f.name }}</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-500">{{ prettySize(f.size) }}</span>
            <button type="button" @click="removeFile(idx)" class="ml-1 text-rose-600 font-black" title="Quitar">
              ✕
            </button>
          </div>
        </div>

        <p
          v-if="error"
          class="mt-4 text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3"
        >
          ⚠️ {{ error }}
        </p>

        <p class="mt-3 text-[10px] text-slate-400 font-bold">
          Enter para enviar • Shift+Enter para salto de línea
        </p>
      </div>
    </div>

    <!-- LIGHTBOX IMAGEN -->
    <Transition name="modal-fade">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[300] flex items-center justify-center p-4"
        @keydown.esc="closeLightbox"
        tabindex="0"
      >
        <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" @click="closeLightbox"></div>

        <Transition name="modal-pop">
          <div
            v-if="lightboxOpen"
            class="relative z-[310] w-full max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/70"
            @click.stop
          >
            <!-- Top bar -->
            <div class="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
              <div class="min-w-0">
                <p class="text-[11px] font-black text-white/90 truncate">
                  {{ modalFile?.original_name || "Imagen" }}
                </p>
                <p class="text-[10px] font-bold text-white/60">
                  {{ modalFile?.mime_type || "image" }} • {{ prettySize(modalFile?.size) }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <a
                  v-if="modalUrl"
                  :href="modalUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/15 transition"
                >
                  Abrir
                </a>
                <button
                  type="button"
                  @click="closeLightbox"
                  class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/10 text-white hover:bg-white/15 transition"
                >
                  Cerrar ✕
                </button>
              </div>
            </div>

            <!-- Image -->
            <div class="p-3 bg-black/60">
              <div class="max-h-[75vh] overflow-auto rounded-2xl">
                <img
                  v-if="modalUrl"
                  :src="modalUrl"
                  :alt="modalFile?.original_name || 'imagen'"
                  class="block w-full h-auto select-none"
                  draggable="false"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- MODAL PDF -->
    <Transition name="modal-fade">
      <div
        v-if="pdfOpen"
        class="fixed inset-0 z-[300] flex items-center justify-center p-4"
        @keydown.esc="closePdf"
        tabindex="0"
      >
        <div class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" @click="closePdf"></div>

        <Transition name="modal-pop">
          <div
            v-if="pdfOpen"
            class="relative z-[310] w-full max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-white"
            @click.stop
          >
            <!-- Top bar -->
            <div class="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
              <div class="min-w-0">
                <p class="text-[11px] font-black text-slate-800 truncate">
                  {{ modalFile?.original_name || "Documento.pdf" }}
                </p>
                <p class="text-[10px] font-bold text-slate-500">
                  {{ prettySize(modalFile?.size) }}
                </p>
              </div>

              <div class="flex items-center gap-2">
                <a
                  v-if="modalUrl"
                  :href="modalUrl"
                  target="_blank"
                  rel="noreferrer"
                  class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Abrir
                </a>
                <button
                  type="button"
                  @click="closePdf"
                  class="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Cerrar ✕
                </button>
              </div>
            </div>

            <!-- PDF iframe -->
            <div class="bg-white">
              <iframe
                v-if="modalUrl"
                :src="modalUrl"
                class="w-full h-[75vh]"
                title="PDF preview"
              ></iframe>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute } from "vue-router";
import axios from "../api/axios";

const route = useRoute();
const conversationId = computed(() => route.params.id);

const loading = ref(false);
const refreshing = ref(false);
const sending = ref(false);
const error = ref("");
const draft = ref("");
const polling = ref(true);

const conversation = ref(null);
const messages = ref([]);

const scrollRef = ref(null);
const isAtBottom = ref(true);
const hasNewWhileUp = ref(false);

// Adjuntos
const fileRef = ref(null);
const pickedFiles = ref([]);

// Modals
const lightboxOpen = ref(false);
const pdfOpen = ref(false);
const modalFile = ref(null);
const modalUrl = ref("");

const title = computed(() => {
  if (!conversation.value) return "Cargando...";
  const users = conversation.value.users ?? [];
  const me = getMyId();
  const other = users.find((u) => u.id !== me) ?? users[0];
  return other?.nombre || other?.name || conversation.value.title || "Conversación";
});

/* =========================
   Helpers de scroll
========================= */
const computeIsAtBottom = () => {
  const el = scrollRef.value;
  if (!el) return true;
  const threshold = 80;
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
};

const onScroll = () => {
  isAtBottom.value = computeIsAtBottom();
  if (isAtBottom.value) hasNewWhileUp.value = false;
};

const scrollToBottom = () => {
  const el = scrollRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

/* =========================
   Adjuntos (Front)
========================= */
const onFiles = (e) => {
  const list = Array.from(e?.target?.files || []);
  const merged = [...pickedFiles.value, ...list];
  const unique = [];
  const seen = new Set();
  for (const f of merged) {
    const key = `${f.name}-${f.size}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }

  pickedFiles.value = unique.slice(0, 6);
  if (fileRef.value) fileRef.value.value = "";
};

const removeFile = (idx) => {
  pickedFiles.value.splice(idx, 1);
  if (pickedFiles.value.length === 0 && fileRef.value) {
    fileRef.value.value = "";
  }
};

const isImage = (a) => {
  const mt = (a?.mime_type || "").toLowerCase();
  if (mt.startsWith("image/")) return true;

  const name = (a?.original_name || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(name);
};

const isPdf = (a) => (a?.mime_type || "") === "application/pdf";
const backendOrigin = () => {
  const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
  return base.replace(/\/api$/, "");
};

const fileAbsoluteUrl = (a) => {
  const origin = backendOrigin();
  if (a?.url) {
    try {
      const u = new URL(a.url);
      const good = new URL(origin);
      u.protocol = good.protocol;
      u.hostname = good.hostname;
      u.port = good.port;
      return u.toString();
    } catch {
    }
  }
  const path = String(a?.file_path || "").replace(/^\/+/, "");
  return `${origin}/storage/${path}`;
};

/* =========================
   Modal helpers
========================= */
const openLightbox = (a) => {
  modalFile.value = a;
  modalUrl.value = fileAbsoluteUrl(a);
  pdfOpen.value = false;
  lightboxOpen.value = true;
  nextTick(() => {
    const el = document.querySelector("[tabindex='0']");
    el?.focus?.();
  });
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  modalFile.value = null;
  modalUrl.value = "";
};

const openPdf = (a) => {
  modalFile.value = a;
  modalUrl.value = fileAbsoluteUrl(a);
  lightboxOpen.value = false;
  pdfOpen.value = true;
  nextTick(() => {
    const el = document.querySelector("[tabindex='0']");
    el?.focus?.();
  });
};

const closePdf = () => {
  pdfOpen.value = false;
  modalFile.value = null;
  modalUrl.value = "";
};

const prettySize = (bytes) => {
  const n = Number(bytes || 0);
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

/* =========================
   Data fetch
========================= */
const refreshAll = async () => {
  await Promise.all([fetchConversation(), fetchMessagesInitial(true)]);
};

const fetchConversation = async () => {
  const res = await axios.get(`/conversations/${conversationId.value}`);
  conversation.value = res.data.data ?? res.data;
};


const fetchMessagesInitial = async (scrollBottom = false) => {
  loading.value = true;
  error.value = "";
  try {
    const res = await axios.get(`/conversations/${conversationId.value}/messages`);
    const data = res.data.data ?? res.data?.data ?? [];
    messages.value = [...data].reverse(); // asc

    await axios.post(`/conversations/${conversationId.value}/read`);

    if (scrollBottom) {
      await nextTick();
      scrollToBottom();
    }
  } catch (e) {
    error.value = "No se pudieron cargar los mensajes.";
  } finally {
    loading.value = false;
  }
};

const pollMessages = async () => {
  if (refreshing.value || loading.value || sending.value) return;

  refreshing.value = true;
  try {
    const res = await axios.get(`/conversations/${conversationId.value}/messages`);
    const dataDesc = res.data.data ?? res.data?.data ?? [];
    const dataAsc = [...dataDesc].reverse();

    const currentLastId = messages.value[messages.value.length - 1]?.id ?? 0;
    const incomingNew = dataAsc.filter((m) => (m.id ?? 0) > currentLastId);

    if (incomingNew.length) {
      const shouldStickBottom = computeIsAtBottom();
      messages.value = [...messages.value, ...incomingNew];

      await nextTick();

      if (shouldStickBottom) scrollToBottom();
      else hasNewWhileUp.value = true;

      await axios.post(`/conversations/${conversationId.value}/read`);
    }
  } catch (e) {
  } finally {
    refreshing.value = false;
  }
};

/* =========================
   Send message (multipart)
========================= */
const send = async () => {
  error.value = "";
  if (sending.value) return;

  const body = draft.value.trim();
  if (!body && pickedFiles.value.length === 0) return;

  sending.value = true;
  try {
    const stick = computeIsAtBottom();

    const fd = new FormData();
    if (body) fd.append("body", body);
    pickedFiles.value.forEach((f) => fd.append("files[]", f));

    await axios.post(`/conversations/${conversationId.value}/messages`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    draft.value = "";
    pickedFiles.value = [];
    if (fileRef.value) fileRef.value.value = "";
    await pollMessages();

    if (stick) {
      await nextTick();
      scrollToBottom();
    }
  } catch (e) {
    error.value = e.response?.data?.message || "No se pudo enviar el mensaje.";
  } finally {
    sending.value = false;
  }
};

/* =========================
   Utils
========================= */
const isMine = (m) => {
  const me = getMyId();
  return m.sender_id === me || m.sender?.id === me;
};

const initials = (name) => {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  const a = (parts[0]?.[0] ?? "C").toUpperCase();
  const b = (parts[1]?.[0] ?? "").toUpperCase();
  return `${a}${b}`;
};

const timeOnly = (dt) => {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

function getMyId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ?? null;
  } catch {
    return null;
  }
}

/* =========================
   Lifecycle
========================= */
let interval = null;

onMounted(async () => {
  await refreshAll();
  await nextTick();
  scrollToBottom();

  interval = setInterval(() => {
    if (!polling.value) return;
    pollMessages();
  }, 4000);

  document.addEventListener("visibilitychange", () => {
    polling.value = !document.hidden;
  });
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.thumb-img {
  width: 260px;  
  max-width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  border-radius: 1rem;
}

/* Animaciones modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-pop-enter-active,
.modal-pop-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.modal-pop-enter-from,
.modal-pop-leave-to {
  transform: translateY(6px) scale(0.98);
  opacity: 0;
}
</style>
