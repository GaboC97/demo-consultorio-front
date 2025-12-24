<template>
    <div class="p-6 md:p-8 max-w-6xl mx-auto">
        <!-- Header -->
        <div
            class="relative overflow-hidden rounded-[2.5rem] border border-white shadow-[0_20px_70px_-15px_rgba(30,58,138,0.15)] mb-8">
            <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950"></div>
            <div class="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>

            <div class="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                        Comunicación interna
                    </p>
                    <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                        Mensajes
                    </h1>
                    <p class="text-blue-100/60 text-[11px] font-bold mt-2">
                        Conversaciones entre médicos dentro del sistema.
                    </p>
                </div>

                <div class="flex gap-3 w-full md:w-auto">
                    <button @click="openNewChat()" class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[1.75rem]
                   bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.25em]
                   shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all">
                        + Nuevo chat
                    </button>
                </div>
            </div>

            <div class="relative z-10 px-10 pb-8">
                <div class="h-px bg-white/10"></div>
            </div>
        </div>

        <!-- Search -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="relative flex-1 group">
                <span
                    class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors font-bold">
                    🔍
                </span>
                <input v-model="search" type="text" placeholder="Buscar por nombre o email..."
                    class="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm
                 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-sm" />
            </div>

            <button @click="refresh()" :disabled="loading"
                class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em]
               bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50">
                🔄 Actualizar
            </button>
        </div>

        <!-- List -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Inbox</p>
                    <h3 class="text-lg font-black text-slate-800">Conversaciones</h3>
                </div>

                <span
                    class="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {{ filtered.length }} chats
                </span>
            </div>

            <div v-if="loading" class="p-8 space-y-4">
                <div v-for="i in 5" :key="i"
                    class="animate-pulse flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div class="h-12 w-12 rounded-2xl bg-slate-200"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-4 w-48 bg-slate-200 rounded"></div>
                        <div class="h-3 w-64 bg-slate-100 rounded"></div>
                    </div>
                    <div class="h-4 w-20 bg-slate-200 rounded"></div>
                </div>
            </div>

            <div v-else-if="filtered.length === 0" class="p-12 text-center">
                <div class="text-4xl mb-3">💬</div>
                <p class="text-slate-600 font-bold">No hay conversaciones todavía.</p>
                <p class="text-[11px] text-slate-400 mt-2">Creá un chat para empezar a escribir.</p>
            </div>

            <div v-else class="p-4">
                <button v-for="c in filtered" :key="c.id" @click="goChat(c.id)" class="w-full text-left group flex items-center gap-4 p-5 rounded-[2rem]
                 hover:bg-blue-50/30 transition-all border border-transparent hover:border-blue-100">
                    <!-- Avatar -->
                    <div class="h-12 w-12 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white
                      flex items-center justify-center font-black shadow-lg shadow-blue-100 border-2 border-white">
                        {{ initials(titleFor(c)) }}
                    </div>

                    <!-- Main -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3">
                            <p
                                class="font-black text-slate-800 uppercase truncate group-hover:text-blue-700 transition-colors">
                                {{ titleFor(c) }}
                            </p>

                            <span v-if="hasUnread(c)"
                                class="px-2.5 py-1 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest">
                                Nuevo
                            </span>
                        </div>

                        <p class="text-[11px] text-slate-500 font-bold mt-1 truncate">
                            {{ lastPreview(c) }}
                        </p>
                    </div>

                    <!-- Meta -->
                    <div class="text-right">
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {{ lastTime(c) }}
                        </p>
                        <p
                            class="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Abrir →
                        </p>
                    </div>
                </button>
            </div>
        </div>

        <!-- Modal: Nuevo chat -->
        <Transition name="modal-fade">
            <div v-if="newChat.open" class="fixed inset-0 z-[200] flex items-center justify-center p-4"
                @click.self="closeNewChat()">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                <Transition name="modal-pop" appear>
                    <div class="w-full max-w-lg relative z-[210]" @click.stop>
                        <div class="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden">
                            <div
                                class="px-8 pt-10 pb-8 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950 relative overflow-hidden">
                                <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl">
                                </div>
                                <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                    Nuevo chat
                                </p>
                                <h3 class="text-2xl font-black text-white tracking-tight">Elegir médico</h3>
                                <p class="text-blue-100/60 text-[11px] font-bold mt-2">
                                    Seleccioná con quién querés conversar.
                                </p>
                            </div>

                            <div class="p-8 space-y-4">
                                <div class="relative group">
                                    <span
                                        class="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors font-bold">
                                        🔎
                                    </span>
                                    <input v-model="newChat.query" @input="searchUsers" type="text"
                                        placeholder="Buscar por nombre o email..."
                                        class="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl
                           focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm transition-all" />
                                </div>

                                <div class="max-h-72 overflow-y-auto custom-scrollbar space-y-2">
                                    <button v-for="u in newChat.users" :key="u.id" @click="startChat(u.id)" class="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white
                           hover:bg-blue-50/30 hover:border-blue-100 transition-all text-left">
                                        <div
                                            class="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                                            {{ (u.nombre?.[0] ?? 'M').toUpperCase() }}
                                        </div>

                                        <div class="flex-1 min-w-0">
                                            <p class="font-black text-slate-800 truncate uppercase">{{ u.nombre }}</p>
                                            <p class="text-[11px] font-bold text-slate-500 truncate">
                                                {{ u.specialty || 'Sin especialidad' }} · MN {{ u.mn || '--' }} · MP {{
                                                    u.mp || '--' }}
                                            </p>
                                        </div>

                                        <span
                                            class="text-[10px] font-black uppercase tracking-widest text-blue-600">Iniciar
                                            →</span>
                                    </button>

                                    <p v-if="newChat.query && newChat.users.length === 0"
                                        class="text-[11px] font-bold text-slate-400 italic text-center py-6">
                                        No se encontraron usuarios.
                                    </p>
                                </div>

                                <p v-if="newChat.error"
                                    class="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                                    ⚠️ {{ newChat.error }}
                                </p>
                            </div>

                            <div class="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                                <button @click="closeNewChat()" class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]
                         text-slate-400 hover:text-white hover:bg-rose-600 transition-all">
                                    Cancelar
                                </button>

                                <button @click="closeNewChat()" class="flex-[1.2] px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]
                         bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
                                    Listo
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../api/axios'

const router = useRouter()
const loading = ref(false)
const conversations = ref([])
const search = ref('')

const newChat = ref({
    open: false,
    query: '',
    users: [],
    error: '',
})

const refresh = async () => {
    loading.value = true
    try {
        const res = await axios.get('/conversations')
        conversations.value = res.data.data ?? res.data
    } finally {
        loading.value = false
    }
}

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return conversations.value
    return conversations.value.filter((c) => {
        const t = titleFor(c).toLowerCase()
        const last = (c.last_message?.body ?? c.lastMessage?.body ?? '').toLowerCase()
        return t.includes(q) || last.includes(q)
    })
})

const goChat = (id) => router.push(`/mensajes/${id}`)

const titleFor = (c) => {
    const users = c.users ?? []
    const me = getMyId()

    const other = users.find(u => u.id !== me) ?? users[0]
    return other?.name || c.title || 'Conversación'
}

const lastPreview = (c) => {
    const lm = c.lastMessage ?? c.last_message
    if (!lm) return 'Sin mensajes aún'
    const sender = lm.sender?.name ? `${lm.sender.name}: ` : ''
    return `${sender}${lm.body ?? ''}`
}

const lastTime = (c) => {
    const lm = c.lastMessage ?? c.last_message
    const dt = lm?.created_at || c.last_message_at
    if (!dt) return ''
    try {
        return new Date(dt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    } catch {
        return ''
    }
}

const initials = (name) => {
    const parts = (name || '').trim().split(' ').filter(Boolean)
    const a = (parts[0]?.[0] ?? 'C').toUpperCase()
    const b = (parts[1]?.[0] ?? '').toUpperCase()
    return `${a}${b}`
}

const hasUnread = (c) => {
    return (c.unread_count ?? 0) > 0
}

// NEW CHAT
const openNewChat = () => {
    newChat.value.open = true
    newChat.value.query = ''
    newChat.value.users = []
    newChat.value.error = ''
}

const closeNewChat = () => {
    newChat.value.open = false
    newChat.value.query = ''
    newChat.value.users = []
    newChat.value.error = ''
}

let usersTimer = null
const searchUsers = () => {
    clearTimeout(usersTimer)
    usersTimer = setTimeout(fetchUsers, 250)
}

const normalize = (s) =>
    (s ?? '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

const fetchUsers = async () => {
    const q = normalize(newChat.value.query).trim()
    newChat.value.error = ''

    if (!q) {
        newChat.value.users = []
        return
    }

    try {
        const res = await axios.get('/users', { params: { role: 'medico', q: newChat.value.query } })
        const list = res.data.data ?? res.data
        newChat.value.users = (list || []
        ).filter((u) => {
            return (
                normalize(u.nombre).includes(q) ||
                normalize(u.specialty).includes(q) ||
                normalize(u.mn).includes(q) ||
                normalize(u.mp).includes(q)
            )
        })
    } catch (e) {
        newChat.value.error = 'No se pudieron cargar usuarios.'
    }
}


const startChat = async (userId) => {
    newChat.value.error = ''
    try {
        const res = await axios.post('/conversations', { user_id: userId })
        const conv = res.data.data ?? res.data
        closeNewChat()
        router.push(`/mensajes/${conv.id}`)
    } catch (e) {
        newChat.value.error = e.response?.data?.message || 'No se pudo crear la conversación.'
    }
}

function getMyId() {
    try {
        const raw = localStorage.getItem('user')
        if (!raw) return null
        const u = JSON.parse(raw)
        return u?.id ?? null
    } catch {
        return null
    }
}

onMounted(refresh)
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

/* Transiciones */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-pop-enter-active {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
    transition: all 0.2s ease-in;
}

.modal-pop-enter-from {
    opacity: 0;
    transform: scale(0.92) translateY(18px);
}

.modal-pop-leave-to {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
}

.toast-enter-active {
    animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
    animation: toast-in 0.4s reverse ease-in;
}

@keyframes toast-in {
    from {
        transform: translateX(100%) scale(0.92);
        opacity: 0;
    }

    to {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}
</style>
