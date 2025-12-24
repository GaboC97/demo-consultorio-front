<template>
  <header
    class="sticky top-0 z-[10]
           px-5 md:px-8 py-3 md:py-3.5
           bg-white/70 backdrop-blur-xl
           border-b border-slate-100/80
           shadow-[0_10px_35px_-25px_rgba(15,23,42,0.22)]"
  >
    <!-- glow line -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px
             bg-gradient-to-r from-transparent via-blue-500/25 to-transparent"
    ></div>

    <div class="flex items-center justify-between gap-4">
      <!-- LEFT -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- tiny icon badge -->
        <div
          class="hidden sm:flex h-10 w-10 rounded-[1.2rem]
                 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950
                 border border-white/10 shadow-md shadow-blue-900/10
                 items-center justify-center text-white font-black text-[12px]"
          title="Panel Clínico"
        >
          PC
        </div>

        <div class="min-w-0">
          <h1 class="text-[15px] md:text-[16px] font-black text-slate-900 tracking-tight truncate leading-tight">
            Panel Clínico
          </h1>

          <p class="mt-0.5 text-[11px] font-bold text-slate-500 truncate">
            Turnos • Pacientes • Mensajes
          </p>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="flex items-center gap-3">
        <!-- user + credenciales (desktop) -->
        <div class="hidden md:flex items-center gap-3 pr-3 border-r border-slate-100">
          <div class="text-right leading-tight">
            <p class="text-[12px] font-black text-slate-900">
              Dr. {{ user?.nombre || '—' }}
            </p>
            <p class="text-[10px] font-bold text-slate-500">
              En línea
            </p>
          </div>

          <!-- MN/MP compactado en una sola pill -->
          <div
            class="inline-flex items-center gap-2 px-3 py-2 rounded-2xl
                   bg-white/60 border border-slate-100 shadow-sm"
          >
            <span class="text-[9px] font-black uppercase tracking-widest text-blue-600/70">
              MN
            </span>
            <span class="text-[10px] font-black text-slate-700">
              {{ user?.mn || '—' }}
            </span>

            <span class="mx-1 h-3 w-px bg-slate-200"></span>

            <span class="text-[9px] font-black uppercase tracking-widest text-indigo-600/70">
              MP
            </span>
            <span class="text-[10px] font-black text-slate-700">
              {{ user?.mp || '—' }}
            </span>
          </div>
        </div>

        <!-- avatar -->
        <div class="relative">
          <div
            class="h-11 w-11 rounded-[1.35rem]
                   bg-gradient-to-br from-blue-600 to-indigo-700
                   shadow-lg shadow-blue-900/10
                   border border-white/40
                   flex items-center justify-center
                   text-white text-[16px] font-black"
          >
            {{ (user?.nombre?.charAt(0) || 'U').toUpperCase() }}
          </div>

          <!-- status dot -->
          <div class="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps(['user'])
</script>
