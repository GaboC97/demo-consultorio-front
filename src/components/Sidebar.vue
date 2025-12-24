<template>
  <aside
    class="hidden lg:flex w-64 flex-col h-screen sticky top-0 z-[10]
           bg-white/70 backdrop-blur-xl
           border-r border-slate-100/80
           shadow-[6px_0_40px_-30px_rgba(15,23,42,0.35)]"
  >
    <!-- top glow line -->
    <div
      class="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
    ></div>

    <!-- BRAND -->
    <div class="p-6 pb-5">
      <div class="flex items-center gap-3">
        <div
          class="h-11 w-11 rounded-[1.5rem]
                 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950
                 border border-white/10 shadow-lg shadow-blue-900/10
                 flex items-center justify-center text-white"
        >
          <BriefcaseMedical class="w-5 h-5" :stroke-width="2.5" />
        </div>

        <div class="min-w-0">
          <p class="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600/70 leading-none">
            MedSystem
          </p>
          <h2 class="text-[16px] font-black tracking-tight text-slate-900 leading-tight">
            Panel Clínico
          </h2>
        </div>
      </div>

      <!-- divider -->
      <div class="mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </div>

    <!-- NAV -->
    <nav class="px-4 pb-5 space-y-2">
      <!-- Dashboard -->
      <router-link to="/dashboard" class="nav-item group" active-class="is-active">
        <span class="nav-icon">
          <span class="text-[16px]">🏠</span>
        </span>
        <span class="nav-label">Dashboard</span>
        <span class="nav-dot"></span>
      </router-link>

      <!-- Turnos -->
      <router-link to="/turnos" class="nav-item group" active-class="is-active">
        <span class="nav-icon">
          <span class="text-[16px]">📅</span>
        </span>
        <span class="nav-label">Turnos</span>
        <span class="nav-dot"></span>
      </router-link>

      <!-- Pacientes -->
      <router-link to="/pacientes" class="nav-item group" active-class="is-active">
        <span class="nav-icon">
          <span class="text-[16px]">👥</span>
        </span>
        <span class="nav-label">Pacientes</span>
        <span class="nav-dot"></span>
      </router-link>

      <!-- Mensajes -->
      <router-link to="/mensajes" class="nav-item group" active-class="is-active">
        <span class="nav-icon">
          <span class="text-[16px]">💬</span>
        </span>

        <span class="nav-label">Mensajes</span>

        <!-- Badge -->
        <span
          v-if="unreadCount > 0"
          class="ml-auto px-2 py-0.5 rounded-full bg-emerald-600 text-white
                 text-[9px] font-black tracking-widest shadow-md shadow-emerald-100"
        >
          {{ unreadCount }}
        </span>

        <!-- Dot -->
        <span class="nav-dot" :class="{ 'nav-dot--on': unreadCount > 0 }"></span>
      </router-link>
    </nav>

    <!-- FOOTER -->
    <div class="mt-auto p-4">
      <div class="rounded-[1.75rem] border border-slate-100 bg-white/60 backdrop-blur-md p-3">
        <button
          @click="$emit('logout')"
          class="w-full flex items-center gap-3 px-4 py-3.5 rounded-[1.4rem]
                 font-black text-[11px] uppercase tracking-[0.2em]
                 text-slate-500 hover:text-rose-600
                 hover:bg-rose-50/60 transition-all
                 active:scale-[0.99]"
        >
          <span
            class="h-9 w-9 rounded-[1.15rem] bg-slate-50 border border-slate-200
                   flex items-center justify-center
                   group-hover:bg-rose-50 group-hover:border-rose-200 transition-all"
          >
            <span class="text-[16px]">🚪</span>
          </span>

          <span class="flex-1 text-left">Salir</span>

          <span class="text-slate-300 group-hover:text-rose-400 transition-colors">→</span>
        </button>
      </div>

      <p class="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 text-center">
        v1.0 • Clínica
      </p>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { BriefcaseMedical } from 'lucide-vue-next'
import axios from '../api/axios'

defineEmits(['logout'])

const unreadCount = ref(0)
const inbox = ref([])

let pollTimer = null

const parseDate = (v) => (v ? new Date(v).getTime() : null)

const hasUnread = (c) => {
  const authUser = JSON.parse(localStorage.getItem('user') || 'null')
  const myId = authUser?.id

  const lastMsgAt = parseDate(c.last_message_at || c.lastMessage?.created_at)
  if (!lastMsgAt) return false
  if (!myId) return false

  const myUserRow = (c.users || []).find(u => u.id === myId)
  const lastReadAt = parseDate(myUserRow?.pivot?.last_read_at)

  if (!lastReadAt) return true
  return lastMsgAt > lastReadAt
}

const loadInbox = async () => {
  try {
    const res = await axios.get('/conversations')
    const data = res.data?.data ?? res.data ?? []
    inbox.value = data
    unreadCount.value = data.reduce((acc, c) => acc + Number(c.unread_count || 0), 0)
  } catch (e) {
    console.error('Inbox error', e)
  }
}

onMounted(async () => {
  await loadInbox()
  pollTimer = setInterval(loadInbox, 12000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style scoped>
/* base item */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 1.35rem;
  border: 1px solid transparent;
  font-weight: 900;
  color: rgb(148 163 184);
  transition: all 220ms ease;
  background: transparent;
}

/* hover */
.nav-item:hover {
  color: rgb(71 85 105);
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(226, 232, 240, 0.8);
}

/* icon chip */
.nav-icon {
  height: 38px;
  width: 38px;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.9);
  transition: all 220ms ease;
}

.nav-item:hover .nav-icon {
  transform: translateY(-1px);
  border-color: rgba(191, 219, 254, 1);
  background: rgba(239, 246, 255, 0.95);
}

/* label */
.nav-label {
  flex: 1;
  letter-spacing: -0.01em;
}

/* dot */
.nav-dot {
  position: relative;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  margin-left: 8px;
  opacity: 0;
  transform: scale(0.9);
  transition: all .25s ease;
}

.nav-dot--on {
  opacity: 1;
  transform: scale(1);
  background: rgba(16, 185, 129, 1);
  box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.12);
}

.nav-dot--on::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(16, 185, 129, 1);
  animation: navPing 1.2s ease-out infinite;
  opacity: 0.6;
}

@keyframes navPing {
  0%   { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(2.3); opacity: 0; }
}

/* ACTIVE */
.is-active {
  color: rgb(37 99 235);
  background: rgba(239, 246, 255, 0.75);
  border-color: rgba(191, 219, 254, 0.65);
  box-shadow: 0 18px 40px -30px rgba(37, 99, 235, 0.45);
}

.is-active .nav-icon {
  background: white;
  border-color: rgba(191, 219, 254, 0.8);
  box-shadow: 0 12px 30px -25px rgba(37, 99, 235, 0.55);
}

.is-active .nav-dot {
  background: rgba(37, 99, 235, 0.85);
}
</style>
