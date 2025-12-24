<template>
  <div class="p-8 max-w-7xl mx-auto relative">

    <!-- TOAST -->
    <Transition name="toast">
      <div
        v-if="toast.visible"
        :class="[
          'fixed top-5 right-5 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border backdrop-blur-md',
          toast.tipo === 'success'
            ? 'bg-emerald-600/90 border-emerald-500 text-white'
            : 'bg-rose-600/90 border-rose-500 text-white'
        ]"
      >
        <CheckCircle v-if="toast.tipo === 'success'" :size="20" />
        <AlertCircle v-else :size="20" />
        <span class="font-black text-[11px] uppercase tracking-widest">{{ toast.mensaje }}</span>
      </div>
    </Transition>

<!-- HEAD PREMIUM (UNIFICADO) -->
<div class="relative overflow-hidden rounded-[2.5rem] border border-white shadow-[0_20px_70px_-15px_rgba(30,58,138,0.15)] mb-8">
  <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950"></div>
  <div class="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
  <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>

  <div class="relative z-10 p-8 md:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
    <!-- title -->
    <div>
      <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
        Gestión clínica
      </p>
      <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
        Listado de Pacientes
      </h2>
      <p class="text-blue-100/60 text-[11px] font-bold mt-2 max-w-xl">
        Gestión y control de pacientes e historias clínicas.
      </p>
    </div>

    <!-- actions -->
    <div class="no-print flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
      <button
        @click="abrirNuevo()"
        class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[1.75rem]
               bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.25em]
               shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        <span class="text-base">➕</span> Nuevo paciente
      </button>

      <button
        @click="exportarExcel"
        class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[1.75rem]
               bg-white/10 text-white font-black text-[11px] uppercase tracking-[0.25em]
               border border-white/10 hover:bg-white/15 active:scale-[0.98] transition-all"
      >
        <span class="text-base">📊</span> Excel
      </button>

      <button
        @click="imprimirListado"
        class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[1.75rem]
               bg-white/10 text-white font-black text-[11px] uppercase tracking-[0.25em]
               border border-white/10 hover:bg-white/15 active:scale-[0.98] transition-all"
      >
        <span class="text-base">🖨️</span> Imprimir
      </button>
    </div>
  </div>

  <!-- buscador flotante -->
  <div class="relative z-10 px-8 md:px-10 pb-8">
    <div class="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex items-center gap-3">
      <div class="h-11 w-11 rounded-[1.35rem] bg-white/10 border border-white/10 flex items-center justify-center text-white/70">
        🔍
      </div>
      <input
        v-model="search"
        @input="buscarPaciente"
        type="text"
        placeholder="Buscar por DNI o Apellido..."
        class="w-full bg-transparent text-white placeholder:text-white/45
               px-2 py-3 outline-none font-bold text-sm"
      />
      <button
        v-if="search"
        @click="search=''; buscarPaciente()"
        class="px-4 py-3 rounded-[1.35rem] text-white/80 hover:text-white hover:bg-white/10
               font-black text-[10px] uppercase tracking-widest transition-all"
      >
        Limpiar
      </button>
    </div>
  </div>

  <div class="relative z-10 px-10 pb-8">
    <div class="h-px bg-white/10"></div>
  </div>
</div>


    <!-- TABLA -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-100">
<thead class="bg-slate-50/60 backdrop-blur-md sticky top-0 z-[1]">
  <tr class="border-b border-slate-100">
    <th class="px-6 py-4 text-left">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Paciente</span>
    </th>
    <th class="px-6 py-4 text-left">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Documento</span>
    </th>
    <th class="px-6 py-4 text-left">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Última consulta</span>
    </th>
    <th class="px-6 py-4 text-right no-print">
      <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Acciones</span>
    </th>
  </tr>
</thead>


        <tbody class="divide-y divide-gray-50">
          <template v-if="cargando">
            <tr v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div class="ml-4 space-y-2">
                    <div class="h-4 w-32 bg-gray-200 rounded"></div>
                    <div class="h-3 w-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap"><div class="h-6 w-24 bg-gray-100 rounded-lg"></div></td>
              <td class="px-6 py-4 whitespace-nowrap"><div class="h-4 w-20 bg-gray-100 rounded"></div></td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <div class="h-8 w-8 bg-gray-100 rounded-lg"></div>
                  <div class="h-8 w-24 bg-gray-200 rounded-xl"></div>
                </div>
              </td>
            </tr>
          </template>

          <template v-else>
            <tr v-for="p in pacientes" :key="p.id" class="hover:bg-blue-50/30 transition-colors group">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 uppercase"
                  >
                    {{ (p.last_name?.[0] ?? '').toUpperCase() }}{{ (p.first_name?.[0] ?? '').toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors uppercase">
                      {{ p.last_name }}, {{ p.first_name }}
                    </div>
                    <div class="text-[10px] text-gray-400 font-medium">Paciente #{{ p.id }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg font-mono font-medium border border-gray-100 text-xs">
                  {{ p.dni }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <span v-if="p.ultima_consulta" class="font-medium">
                  {{ new Date(p.ultima_consulta).toLocaleDateString() }}
                </span>
                <span v-else class="text-gray-300 italic text-xs">Sin consultas</span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right text-sm no-print">
                <div class="flex justify-end items-center gap-3">
                  <button
                    @click="abrirEdicion(p)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <router-link
                    :to="'/pacientes/' + p.id"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                  >
                    Abrir Ficha
                  </router-link>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!cargando && pacientes.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-400">
              <div class="text-4xl mb-2">📁</div>
              <p class="text-sm font-medium">No se encontraron pacientes para esa búsqueda.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINACIÓN -->
    <div class="flex flex-col md:flex-row justify-between items-center mt-8 px-2 gap-4 no-print border-t border-gray-100 pt-6">
      <div class="text-sm text-gray-500 font-medium order-2 md:order-1">
        Mostrando página <span class="text-blue-600 font-extrabold">{{ pagination.current_page }}</span> de
        <span class="text-gray-800 font-bold">{{ pagination.last_page }}</span>
      </div>

      <div class="flex items-center gap-2 order-1 md:order-2">
        <button
          @click="cambiarPagina(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
          <template v-for="page in paginasAMostrar" :key="page">
            <button
              v-if="page !== '...'"
              @click="cambiarPagina(page)"
              :class="[
                'min-w-[40px] h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all',
                pagination.current_page === page
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                  : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm'
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-2 text-gray-400 font-medium italic">...</span>
          </template>
        </div>

        <button
          @click="cambiarPagina(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

<!-- MODAL PREMIUM (UNIFICADO) -->
<Transition name="modal-fade">
  <div
    v-if="modal.visible"
    class="fixed absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4"
    @click.self="closeModal()"
  >
    <!-- backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <div class="pointer-events-none absolute inset-0
             bg-gradient-to-b from-white/5 via-transparent to-black/10"></div>

    <Transition name="modal-pop" appear>
      <div v-if="modal.visible" class="w-full max-w-2xl relative z-[170]" @click.stop>
        <form
          @submit.prevent="savePatient"
          class="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(30,58,138,0.15)] border border-white overflow-visible flex flex-col max-h-[90vh]"
        >
          <!-- HEADER -->
          <div class="relative px-8 pt-12 pb-12 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950 rounded-t-[2.5rem]">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>

            <div class="relative z-10">
              <div class="flex items-center gap-5">
                <div class="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/10 shadow-inner">
                  <UserPlus class="w-7 h-7 text-white" />
                </div>

                <div>
                  <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                    Admisión de Pacientes
                  </p>

                  <h3 class="text-3xl font-black text-white tracking-tight">
                    {{ modal.modo === 'edit' ? 'Editar Ficha Clínica' : 'Nueva Ficha Clínica' }}
                  </h3>

                  <p class="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-2">
                    {{ modal.modo === 'edit' ? `Paciente #${form.id}` : 'Registro de ingreso' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TABS (SEPARADOS + CENTRADOS) -->
          <div class="px-8 -mt-6 relative z-[200] flex justify-center">
            <div
              class="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[1.75rem] p-2 flex gap-2 w-full sm:w-fit"
            >
              <button
                type="button"
                @click="activeTab = 'personal'"
                :class="[
                  activeTab === 'personal'
                    ? 'bg-slate-900 text-white shadow-xl scale-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white scale-95'
                ]"
                class="flex-1 sm:flex-none px-8 py-3 rounded-[1.35rem] text-[10px] font-black uppercase transition-all duration-300"
              >
                1. Información Personal
              </button>

              <button
                type="button"
                @click="activeTab = 'clinical'"
                :class="[
                  activeTab === 'clinical'
                    ? 'bg-slate-900 text-white shadow-xl scale-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white scale-95'
                ]"
                class="flex-1 sm:flex-none px-8 py-3 rounded-[1.35rem] text-[10px] font-black uppercase transition-all duration-300"
              >
                2. Perfil Médico
              </button>
            </div>
          </div>

          <!-- BODY (COMPENSA PARA QUE NO TAPE LOS TABS) -->
          <div class="p-10 pt-12 overflow-y-auto min-h-[420px] bg-white">
            <!-- PERSONAL -->
            <div v-if="activeTab === 'personal'" class="grid grid-cols-2 gap-6 animate-in">
              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nombre del Paciente</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  required
                  placeholder="JUAN"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm uppercase transition-all"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Apellido</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  required
                  placeholder="PEREZ"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm uppercase transition-all"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">DNI / Pasaporte</label>
                <input
                  v-model="form.dni"
                  type="text"
                  required
                  placeholder="Solo números"
                  :disabled="modal.modo === 'edit'"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <p v-if="modal.modo === 'edit'" class="text-[10px] text-slate-400 font-bold mt-2 ml-1">
                  * El DNI no se edita
                </p>
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Correo Electrónico</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm lowercase transition-all"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Fecha de Nacimiento</label>
                <input
                  v-model="form.birth_date"
                  type="date"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm text-slate-600 transition-all"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Obra Social / Prepaga</label>
                <input
                  v-model="form.social_security"
                  type="text"
                  placeholder="Ej: OSDE 310"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm transition-all uppercase"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Teléfono / Celular</label>
                <input
                  v-model="form.phone"
                  type="text"
                  placeholder="Ej: 11 1234 5678"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm transition-all"
                />
              </div>

              <div class="col-span-1">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Género</label>
                <select
                  v-model="form.gender"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="X">Otro / X</option>
                </select>
              </div>

              <div class="col-span-2">
                <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Factor Sanguíneo</label>
                <div class="relative">
                  <select
                    v-model="form.blood_type"
                    class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Seleccione grupo</option>
                    <option v-for="t in ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']" :key="t" :value="t">
                      {{ t }}
                    </option>
                  </select>
                  <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Activity :size="16" />
                  </div>
                </div>
              </div>
            </div>

            <!-- CLINICAL -->
            <div v-if="activeTab === 'clinical'" class="space-y-10 animate-in">
              <div class="space-y-4">
                <label class="flex items-center gap-2 text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">
                  <Activity :size="16" class="animate-pulse" /> Alergias Registradas
                </label>
                <div
                  class="flex flex-wrap gap-2.5 p-5 bg-amber-50/20 border border-amber-100 rounded-[2.5rem] min-h-[140px] max-h-[200px] overflow-y-auto custom-scroll content-start"
                >
                  <button
                    v-for="a in alergias"
                    :key="a.id"
                    @click="toggleSelection('allergy_ids', a.id)"
                    type="button"
                    :class="[
                      form.allergy_ids.includes(a.id)
                        ? 'bg-amber-600 text-white shadow-xl shadow-amber-200 scale-105 border-amber-600'
                        : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                    ]"
                    class="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95"
                  >
                    {{ a.name }}
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <label class="flex items-center gap-2 text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">
                  <Stethoscope :size="16" /> Patologías Crónicas
                </label>
                <div
                  class="flex flex-wrap gap-2.5 p-5 bg-rose-50/20 border border-rose-100 rounded-[2.5rem] min-h-[140px] max-h-[200px] overflow-y-auto custom-scroll content-start"
                >
                  <button
                    v-for="p in patologias"
                    :key="p.id"
                    @click="toggleSelection('pathology_ids', p.id)"
                    type="button"
                    :class="[
                      form.pathology_ids.includes(p.id)
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 scale-105 border-rose-600'
                        : 'bg-white text-rose-600 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                    ]"
                    class="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95"
                  >
                    {{ p.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="p-8 bg-slate-50/50 flex items-center gap-5 border-t border-slate-100 backdrop-blur-sm rounded-b-[2.5rem]">
            <button
              type="button"
              @click="closeModal()"
              :disabled="loading"
              class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>

            <div class="flex-[2] flex gap-4">
              <button
                v-if="activeTab === 'clinical'"
                type="button"
                @click="activeTab = 'personal'"
                class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Anterior
              </button>

              <button
                v-if="activeTab === 'personal'"
                type="button"
                @click="activeTab = 'clinical'"
                class="flex-1 bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl bg-indigo-900 shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Siguiente paso
              </button>

              <button
                v-else
                type="submit"
                :disabled="loading"
                class="flex-[1.5] flex items-center justify-center gap-3 bg-indigo-600 text-white px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl bg-indigo-900 shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30"
              >
                <Save v-if="!loading" :size="16" />
                <Loader2 v-else class="animate-spin" :size="16" />
                {{ loading ? 'Procesando...' : (modal.modo === 'edit' ? 'Guardar Cambios' : 'Crear Paciente') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from '../api/axios';
import * as XLSX from 'xlsx';
import {
  UserPlus, Stethoscope, Activity, Save,
  Loader2, CheckCircle, AlertCircle
} from 'lucide-vue-next';

/* ======================
   LISTADO / ESTADOS
====================== */
const pacientes = ref([]);
const search = ref('');
const pagination = ref({ current_page: 1, last_page: 1 });
const cargando = ref(false);

let timeout = null;

/* ======================
   MODAL PREMIUM / FORM
====================== */
const modal = ref({ visible: false, modo: 'create' });
const activeTab = ref('personal');
const loading = ref(false);

const alergias = ref([]);
const patologias = ref([]);

const toast = ref({ visible: false, mensaje: '', tipo: 'success' });

const form = ref({
  id: null,
  first_name: '',
  last_name: '',
  dni: '',
  email: '',
  phone: '',
  birth_date: '',
  social_security: '',
  blood_type: '',
  gender: 'M',
  allergy_ids: [],
  pathology_ids: [],
});

/* ======================
   HELPERS
====================== */
const showToast = (mensaje, tipo = 'success') => {
  toast.value = { visible: true, mensaje, tipo };
  setTimeout(() => (toast.value.visible = false), 3500);
};

const resetForm = () => {
  form.value = {
    id: null,
    first_name: '',
    last_name: '',
    dni: '',
    email: '',
    phone: '',
    birth_date: '',
    social_security: '',
    blood_type: '',
    gender: 'M',
    allergy_ids: [],
    pathology_ids: [],
  };
  activeTab.value = 'personal';
};

const openModal = (modo = 'create') => {
  modal.value = { visible: true, modo };
  activeTab.value = 'personal';
};

const closeModal = () => {
  modal.value.visible = false;
  modal.value.modo = 'create';
  activeTab.value = 'personal';
};


/* Escape para cerrar */
const onKey = (e) => {
  if (e.key === 'Escape' && modal.value.visible) closeModal();
};

/* ======================
   PAGINACIÓN INTELIGENTE
====================== */
const paginasAMostrar = computed(() => {
  const current = pagination.value.current_page;
  const last = pagination.value.last_page;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) range.push(i);
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) rangeWithDots.push(l + 1);
      else if (i - l !== 1) rangeWithDots.push('...');
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

/* ======================
   FETCH
====================== */
const fetchPacientes = async (page = 1) => {
  cargando.value = true;
  try {
    const res = await axios.get('/pacientes', { params: { page, search: search.value } });
    pacientes.value = res.data.data;
    pagination.value = { current_page: res.data.current_page, last_page: res.data.last_page };
  } catch (e) {
    console.error('Error cargando pacientes:', e);
    showToast('Error al cargar pacientes', 'error');
  } finally {
    setTimeout(() => (cargando.value = false), 250);
  }
};

const fetchCatalogos = async () => {
  try {
    const [a, p] = await Promise.all([axios.get('/alergias'), axios.get('/patologias')]);
    alergias.value = a.data.data ?? a.data;
    patologias.value = p.data.data ?? p.data;
  } catch (e) {
    console.error('Error catálogos:', e);
    showToast('Error al cargar datos médicos', 'error');
  }
};

/* ======================
   ACCIONES LISTADO
====================== */
const cambiarPagina = (n) => {
  if (n === '...' || n < 1 || n > pagination.value.last_page) return;
  fetchPacientes(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const buscarPaciente = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => fetchPacientes(1), 400);
};

/* ======================
   ABRIR MODAL CREATE/EDIT
====================== */
const abrirNuevo = () => {
  resetForm();
  modal.value.modo = 'create';
  openModal('create');
};

const abrirEdicion = (p) => {
  resetForm();

  form.value = {
    id: p.id,
    first_name: p.first_name ?? '',
    last_name: p.last_name ?? '',
    dni: p.dni ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    birth_date: p.birth_date ?? '',
    social_security: p.social_security ?? '',
    blood_type: p.blood_type ?? '',
    gender: p.gender ?? 'M',
    allergy_ids: Array.isArray(p.allergies) ? p.allergies.map(a => a.id) : [],
    pathology_ids: Array.isArray(p.pathologies) ? p.pathologies.map(x => x.id) : [],
  };

  openModal('edit');
};


/* ======================
   GUARDAR (POST/PUT)
====================== */
const savePatient = async () => {
  loading.value = true;
  try {
    console.log('FORM EMAIL >>>', form.value.email, typeof form.value.email);
    const payload = {
      ...form.value,
      first_name: (form.value.first_name || '').toUpperCase(),
      last_name: (form.value.last_name || '').toUpperCase(),
      email: (form.value.email || '').trim().toLowerCase(),
    };
console.log('PAYLOAD EMAIL >>>', payload.email, typeof payload.email);
    // ✅ si estás editando y el email quedó vacío, NO lo mandes
    if (modal.value.modo === 'edit' && payload.email === '') {
      delete payload.email;
    }

    if (modal.value.modo === 'edit' && form.value.id) {
      await axios.put(`/pacientes/${form.value.id}`, payload);
      showToast('FICHA ACTUALIZADA CON ÉXITO');
      closeModal();
      fetchPacientes(pagination.value.current_page);
    } else {
      await axios.post('/pacientes', payload);
      showToast('PACIENTE REGISTRADO CON ÉXITO');
      closeModal();
      fetchPacientes(1);
    }
  } catch (error) {
    showToast(error.response?.data?.message || 'Error al procesar el registro', 'error');
  } finally {
    loading.value = false;
  }
};


/* ======================
   MULTISELECT TOGGLE
====================== */
const toggleSelection = (key, id) => {
  if (!Array.isArray(form.value[key])) form.value[key] = [];

  const idx = form.value[key].indexOf(id);
  if (idx === -1) form.value[key].push(id);
  else form.value[key].splice(idx, 1);
};


/* ======================
   EXCEL / PRINT
====================== */
const exportarExcel = () => {
  const data = pacientes.value.map(p => ({
    ID: p.id,
    Apellido: p.last_name,
    Nombre: p.first_name,
    DNI: p.dni,
    Email: p.email,
    Teléfono: p.phone,
    'Obra Social': p.social_security,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
  XLSX.writeFile(wb, 'pacientes.xlsx');
};

const imprimirListado = () => window.print();

/* ======================
   LIFE CYCLE
====================== */
onMounted(() => {
  fetchPacientes();
  fetchCatalogos();
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<style scoped>
@media print {
  .no-print { display: none !important; }
}

/* Toast */
.toast-enter-active { animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-leave-active { animation: toast-in 0.35s reverse ease-in; }
@keyframes toast-in {
  from { transform: translateX(100%) scale(0.9); opacity: 0; }
  to { transform: translateX(0) scale(1); opacity: 1; }
}

/* Fondo modal */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Caja modal */
.modal-pop-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-pop-leave-active { transition: all 0.22s ease-in; }
.modal-pop-enter-from { opacity: 0; transform: scale(0.9) translateY(30px); }
.modal-pop-leave-to { opacity: 0; transform: scale(0.96) translateY(16px); }

.animate-in { animation: fade-up 0.35s ease-out; }
@keyframes fade-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
