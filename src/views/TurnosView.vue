<template>
    <!-- LOADING OVERLAY GLOBAL (guardar / eliminar) -->
    <Transition name="fade">
        <div v-if="isSaving || isDeleting" class="fixed inset-0 z-[120] flex items-center justify-center">
            <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
            <div
                class="relative z-[130] bg-white rounded-[2rem] border border-slate-100 shadow-2xl px-8 py-6 flex items-center gap-4">
                <Loader2 class="animate-spin text-blue-600" :size="22" />
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Procesando
                    </p>
                    <p class="text-sm font-extrabold text-slate-800">
                        {{ isDeleting ? 'Eliminando registro...' : 'Guardando cambios...' }}
                    </p>
                </div>
            </div>
        </div>
    </Transition>

    <!-- TOAST -->
    <Transition name="toast">
        <div v-if="notificacion.visible" :class="[
            'fixed top-5 right-5 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border',
            notificacion.tipo === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'
        ]">
            <CheckCircle v-if="notificacion.tipo === 'success'" :size="20" />
            <AlertCircle v-else :size="20" />
            <span class="font-bold tracking-tight">{{ notificacion.mensaje }}</span>
        </div>
    </Transition>


    <div class="p-10 max-w-5xl mx-auto w-full">
        <div class="flex items-start justify-between mb-10 gap-6">
            <div>
                <h2 class="text-4xl font-black text-slate-900 tracking-tight">
                    {{ tabLista === 'turnos' ? 'Mis Turnos' : 'Derivaciones' }}
                </h2>
                <p class="text-slate-500 font-semibold mt-2">
                    {{ tabLista === 'turnos'
                        ? 'Organiza tus citas médicas y pacientes.'
                        : 'Gestioná interconsultas enviadas y recibidas.'
                    }}
                </p>
            </div>

            <div class="flex flex-col gap-4 items-end">
                <button @click="abrirModalNuevo" :disabled="isSaving || isDeleting"
                    class="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mb-2">
                    <Plus :size="18" class="group-hover:rotate-90 transition-transform" />

                    NUEVO TURNO / DERIVACIÓN
                </button>

                <div class="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                    <button @click="setTabLista('turnos')" :disabled="isSaving || isDeleting"
                        :class="[tabLista === 'turnos' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500']"
                        class="px-6 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Turnos
                    </button>
                    <button @click="setTabLista('derivaciones')" :disabled="isSaving || isDeleting"
                        :class="[tabLista === 'derivaciones' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500']"
                        class="px-6 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Derivaciones
                    </button>
                </div>

                <div v-if="tabLista === 'turnos'" class="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                    <button @click="filtro = 'hoy'" :disabled="isSaving || isDeleting"
                        :class="[filtro === 'hoy' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500']"
                        class="px-6 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Hoy
                    </button>
                    <button @click="filtro = 'semana'" :disabled="isSaving || isDeleting"
                        :class="[filtro === 'semana' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500']"
                        class="px-6 py-2 rounded-xl text-xs font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Próximos 7 días
                    </button>
                </div>

                <div v-if="tabLista === 'derivaciones'" class="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
                    <button @click="filtroDeriv = 'todas'" :disabled="isSaving || isDeleting"
                        :class="[filtroDeriv === 'todas' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500']"
                        class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Todas
                    </button>
                    <button @click="filtroDeriv = 'enviadas'" :disabled="isSaving || isDeleting"
                        :class="[filtroDeriv === 'enviadas' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500']"
                        class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Enviadas
                    </button>
                    <button @click="filtroDeriv = 'recibidas'" :disabled="isSaving || isDeleting"
                        :class="[filtroDeriv === 'recibidas' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500']"
                        class="px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        Recibidas
                    </button>
                </div>
            </div>
        </div>

        <!-- LISTADO -->
        <div
            class="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
            <div v-if="listaAMostrar.length > 0" class="divide-y divide-slate-50">
                <div v-for="turno in listaAMostrar" :key="turno.id"
                    class="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group"
                    :class="{ 'bg-amber-50/30': Number(turno.es_derivacion) === 1 && !turno.fecha }">
                    <div class="flex items-center gap-8">
                        <div class="flex flex-col items-center min-w-[80px]">
                            <span class="text-2xl font-black text-slate-800 leading-none">{{ turno.hora || '--:--'
                                }}</span>
                            <span :class="[turno.fecha ? 'text-blue-500 bg-blue-50' : 'text-amber-500 bg-amber-50']"
                                class="text-[10px] font-black uppercase mt-2 px-2 py-0.5 rounded-md">
                                {{ turno.fecha || 'Por asignar' }}
                            </span>
                        </div>

                        <div class="h-12 w-[2px] bg-slate-100"></div>

                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <p class="text-lg font-black text-slate-800">
                                    {{ turno.paciente?.last_name }}, {{ turno.paciente?.first_name }}
                                </p>

                                <!-- Chips de Derivación -->
                                <template v-if="Number(turno.es_derivacion) === 1">
                                    <span v-if="turno.prioridad" :class="getPrioridadClass(turno.prioridad)"
                                        class="text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                        {{ turno.prioridad }}
                                    </span>

                                    <span v-if="esEnviada(turno)"
                                        class="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                        <ArrowUpRight :size="10" /> Enviada
                                    </span>
                                    <span v-else
                                        class="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                        <ArrowDownLeft :size="10" /> Recibida
                                    </span>
                                </template>
                            </div>

                            <p class="text-sm text-slate-400 font-medium">
                                <template v-if="Number(turno.es_derivacion) === 1">
                                    <span v-if="!esEnviada(turno)" class="text-indigo-500 font-bold">
                                        Dr/a. {{ turno.medico_emisor?.nombre }}
                                    </span>
                                    <span v-else class="text-slate-500 font-bold">
                                        Para: Dr/a. {{ turno.medico_receptor?.nombre }}
                                    </span>
                                    <span class="mx-1">•</span>
                                </template>

                                {{ turno.motivo || 'Consulta de control' }}
                            </p>
                        </div>
                    </div>

                    <!-- Acciones derecha -->
                    <div class="flex items-center gap-3">
                        <!-- Edit / Delete -->
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button v-if="puedeEditar(turno)" :disabled="isSaving || isDeleting"
                                @click="editarTurno(turno)"
                                class="h-10 w-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Editar">
                                ✏️
                            </button>

                            <button v-if="puedeEliminar(turno)" :disabled="isSaving || isDeleting"
                                @click="abrirConfirmEliminar(turno)"
                                class="h-10 w-10 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 flex items-center justify-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                title="Eliminar">
                                <Trash2 class="text-rose-600" :size="18" />
                            </button>
                        </div>

                        <!-- Botón principal -->
                        <button :disabled="isSaving || isDeleting" @click="verDetalleTurno(turno)" :class="[
                            (puedeGestionarDerivacion(turno))
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : (Number(turno.es_derivacion) === 1 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'),
                            (isSaving || isDeleting) ? 'opacity-60 cursor-not-allowed' : ''
                        ]" class="px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg">
                            {{
                                puedeGestionarDerivacion(turno)
                                    ? 'ASIGNAR FECHA'
                                    : (Number(turno.es_derivacion) === 1 ? 'VER DETALLE' : 'ATENDER')
                            }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="p-24 text-center">
                <div class="text-6xl mb-6">{{ tabLista === 'turnos' ? '🗓️' : '📨' }}</div>
                <p class="text-slate-400 font-black uppercase text-sm tracking-[0.2em]">
                    {{ tabLista === 'turnos' ? 'No hay actividad programada' : 'No hay derivaciones para mostrar' }}
                </p>
            </div>
        </div>
    </div>

    <!-- MODAL NUEVO / EDITAR -->
<!-- MODAL NUEVO / EDITAR (CON TABS FLOTANTES CENTRADOS) -->
<Transition name="fade">
  <div
    v-if="showModalTurno"
    class="fixed absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4"
    @click.self="isSaving ? null : cerrarModal()"
  >
    <!-- backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

    <div class="pointer-events-none absolute inset-0
             bg-gradient-to-b from-white/5 via-transparent to-black/10"></div>
    <Transition name="modal-pop" appear>
      <div
        v-if="showModalTurno"
        class="w-full max-w-lg relative z-[190]"
        @click.stop
      >
        <div
          class="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- HEADER -->
          <div class="relative px-8 pt-10 pb-10 overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950 rounded-t-[2.5rem]">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"></div>

            <div class="relative z-10 flex flex-col gap-5">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="[modoEdicion ? 'bg-amber-400/20 text-amber-300 border-amber-400/30' : 'bg-blue-400/20 text-blue-300 border-blue-400/30']"
                    class="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] border backdrop-blur-md"
                  >
                    {{ modoEdicion ? 'Modo Edición' : 'Nuevo Registro' }}
                  </span>
                </div>

                <h3 class="text-3xl font-black text-white tracking-tight">
                  {{
                    modoEdicion
                      ? (tabActivo === 'derivacion' ? 'Editar Derivación' : 'Editar Turno')
                      : (tabActivo === 'derivacion' ? 'Nueva Derivación' : 'Nuevo Turno')
                  }}
                </h3>

                <p class="text-blue-100/60 text-xs font-medium mt-1">
                  {{ modoEdicion ? 'Actualice los datos del registro médico' : 'Complete los campos para generar la orden médica' }}
                </p>
              </div>
            </div>
          </div>

          <!-- TABS FLOTANTES (CENTRADOS) -->
          <div class="px-8 -mt-6 relative z-[200] flex justify-center">
            <div class="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[1.75rem] p-2 flex gap-2 w-full sm:w-fit">
              <button
                type="button"
                @click="tabActivo = 'normal'"
                :disabled="isSaving || (modoEdicion && Number(turnoEditandoEsDerivacion) === 1)"
                :class="[
                  tabActivo === 'normal'
                    ? 'bg-slate-900 text-white shadow-xl scale-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white scale-95',
                  (modoEdicion && Number(turnoEditandoEsDerivacion) === 1) ? 'opacity-30 cursor-not-allowed' : ''
                ]"
                class="flex-1 sm:flex-none px-8 py-3 rounded-[1.35rem] text-[10px] font-black uppercase transition-all duration-300"
              >
                Turno
              </button>

              <button
                type="button"
                @click="tabActivo = 'derivacion'"
                :disabled="isSaving || (modoEdicion && Number(turnoEditandoEsDerivacion) === 0)"
                :class="[
                  tabActivo === 'derivacion'
                    ? 'bg-slate-900 text-white shadow-xl scale-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white scale-95',
                  (modoEdicion && Number(turnoEditandoEsDerivacion) === 0) ? 'opacity-30 cursor-not-allowed' : ''
                ]"
                class="flex-1 sm:flex-none px-8 py-3 rounded-[1.35rem] text-[10px] font-black uppercase transition-all duration-300"
              >
                Derivación
              </button>
            </div>
          </div>

          <!-- BODY (COMPENSA EL -mt DE LOS TABS) -->
          <div class="p-8 pt-12 overflow-y-auto bg-white">
            <form @submit.prevent="guardarTurno" class="space-y-6">
              <!-- Paciente -->
              <div class="relative">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">
                  Paciente
                </label>

                <input
                  v-model="busquedaPaciente"
                  :disabled="isSaving"
                  type="text"
                  placeholder="Buscar por DNI o Apellido..."
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-500/50 transition-all disabled:opacity-60"
                />

                <div
                  v-if="resultadosPacientes.length > 0 && !isSaving"
                  class="absolute z-[80] w-full mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2"
                >
                  <button
                    v-for="p in resultadosPacientes"
                    :key="p.id"
                    type="button"
                    @click="seleccionarPaciente(p)"
                    class="w-full px-5 py-4 text-left hover:bg-blue-50 border-b border-slate-50 flex justify-between items-center transition-colors group"
                  >
                    <span class="font-bold text-slate-700 text-sm group-hover:text-blue-600">
                      {{ p.last_name }}, {{ p.first_name }}
                    </span>
                    <span class="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                      DNI: {{ p.dni }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Derivación -->
              <div v-if="tabActivo === 'derivacion'" class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">
                      Médico Destino
                    </label>
                    <select
                      v-model="formTurno.medico_id"
                      :disabled="isSaving"
                      class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none disabled:opacity-60"
                    >
                      <option value="" disabled>Seleccione...</option>
                      <option v-for="med in medicosFiltrados" :key="med.id" :value="med.id">
                        Dr/a. {{ med.nombre }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">
                      Prioridad
                    </label>
                    <select
                      v-model="formTurno.prioridad"
                      :disabled="isSaving"
                      class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none disabled:opacity-60"
                    >
                      <option value="baja">🟢 Baja</option>
                      <option value="media">🟡 Media</option>
                      <option value="alta">🟠 Alta</option>
                      <option value="urgente">🔴 Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">
                    Documentación
                  </label>

                  <input
                    type="file"
                    ref="fileInput"
                    @change="manejarArchivos"
                    multiple
                    class="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    :disabled="modoEdicion || isSaving"
                  />

                  <div
                    @click="(modoEdicion || isSaving) ? null : $refs.fileInput.click()"
                    :class="[(modoEdicion || isSaving) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100']"
                    class="mt-1 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 transition-all"
                  >
                    <span class="text-2xl mb-1">📂</span>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {{ modoEdicion ? 'Adjuntos no editables' : 'Adjuntar estudios' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Turno -->
              <div v-if="tabActivo === 'normal'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1.5 block">Fecha</label>
                  <input
                    v-model="formTurno.fecha"
                    :disabled="isSaving"
                    type="date"
                    class="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm disabled:opacity-60"
                  >
                </div>

                <div>
                  <label class="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1.5 block">Hora</label>
                  <input
                    v-model="formTurno.hora"
                    :disabled="isSaving"
                    type="time"
                    class="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm disabled:opacity-60"
                  >
                </div>
              </div>

              <div>
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-1.5 block">
                  Motivo / Observaciones
                </label>
                <textarea
                  v-model="formTurno.motivo"
                  :disabled="isSaving"
                  rows="3"
                  placeholder="Escriba el motivo clínico..."
                  class="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold text-sm resize-none disabled:opacity-60"
                ></textarea>
              </div>

              <!-- FOOTER -->
              <div class="flex gap-4 pt-2">
                <button
                  type="button"
                  @click="cerrarModal"
                  :disabled="isSaving"
                  class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>

                <!-- ✅ Botón igual en ambos tabs (azul premium) -->
                <button
                  type="submit"
                  :disabled="isSaving || !pacienteSeleccionado || (tabActivo === 'derivacion' && !formTurno.medico_id)"
                  class="flex-[1.5] text-white px-4 py-4 rounded-2xl font-black text-[11px] uppercase
                         bg-indigo-900 shadow-indigo-200
                         shadow-xl shadow-blue-200
                         transition-all flex items-center justify-center gap-2
                         hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Loader2 v-if="isSaving" class="animate-spin" :size="16" />
                  <span>{{ modoEdicion ? 'Guardar' : (isSaving ? '...' : 'Confirmar') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</Transition>

    <!-- DETALLE DERIVACIÓN -->
<Transition name="fade">
        <div v-if="turnoDetalle" class="fixed absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                @click="(isSaving || isDeleting) ? null : (turnoDetalle = null)"></div>

            <Transition name="modal-pop" appear>
                <div v-if="turnoDetalle"
                    class="bg-white rounded-[2.5rem] w-full max-w-lg relative z-[70] shadow-2xl border border-white/20 overflow-hidden flex flex-col">
                    
                    <div class="relative px-8 pt-10 pb-8 overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-950">
                        <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
                        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-slate-400/10 rounded-full blur-3xl"></div>
                        
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center gap-4">
                                    <div class="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                                        <BriefcaseMedical class="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p class="text-indigo-200/60 text-[10px] font-black uppercase tracking-[0.2em]">Expediente Médico</p>
                                        <h3 class="text-2xl font-black text-white tracking-tight">
                                            {{ turnoDetalle.paciente?.last_name }}, {{ turnoDetalle.paciente?.first_name }}
                                        </h3>
                                    </div>
                                </div>
                                <div v-if="turnoDetalle.prioridad" 
                                    :class="getPrioridadClass(turnoDetalle.prioridad)"
                                    class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-white/10 shadow-lg backdrop-blur-md">
                                    {{ turnoDetalle.prioridad }}
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-3">
                                <div class="bg-black/20 px-4 py-2 rounded-xl border border-white/5 text-[11px] font-bold text-indigo-100 backdrop-blur-sm">
                                    <span class="opacity-50 mr-1 font-normal">DNI:</span> {{ turnoDetalle.paciente?.dni }}
                                </div>
                                <div class="bg-black/20 px-4 py-2 rounded-xl border border-white/5 text-[11px] font-bold text-indigo-100 backdrop-blur-sm">
                                    <span class="opacity-50 mr-1 font-normal">Emisor:</span> Dr/a. {{ turnoDetalle.medico_emisor?.nombre }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-8 overflow-y-auto space-y-8 bg-white">
                        <div>
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Motivo de Derivación</h4>
                            <div class="bg-slate-50 border border-slate-100 p-6 rounded-[1.5rem] relative group transition-all hover:bg-slate-100/50">
                                <p class="text-slate-700 font-bold leading-relaxed italic text-sm">
                                    "{{ turnoDetalle.motivo || 'No se especificó un motivo.' }}"
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Estudios Adjuntos</h4>
                            <div v-if="turnoDetalle.archivos && turnoDetalle.archivos.length > 0" class="grid grid-cols-1 gap-3">
                                <a v-for="archivo in turnoDetalle.archivos" :key="archivo.id" :href="archivo.url"
                                    target="_blank"
                                    class="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all group">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                            <span class="text-lg text-slate-400 group-hover:text-indigo-500 transition-colors">📄</span>
                                        </div>
                                        <span class="text-xs font-black text-slate-600 group-hover:text-slate-900 transition-colors">
                                            {{ archivo.nombre_original }}
                                        </span>
                                    </div>
                                    <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-3 py-1 bg-indigo-50 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all">Ver</span>
                                </a>
                            </div>

                            <div v-else class="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl flex items-center gap-4">
                                <span class="text-xl">📂</span>
                                <p class="text-xs font-bold text-amber-700 uppercase tracking-tight">Sin documentación adjunta.</p>
                            </div>
                        </div>

                        <div v-if="!turnoDetalle.fecha && puedeGestionarDerivacion(turnoDetalle)"
                            class="pt-6 border-t border-dashed border-slate-200">
                            <div class="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center">
                                    Agendar Cita de Especialista
                                </p>
                                <div class="grid grid-cols-2 gap-4 mb-6">
                                    <div class="space-y-1.5">
                                        <label class="text-[9px] font-black uppercase text-slate-400 ml-2">Fecha sugerida</label>
                                        <input v-model="formAceptar.fecha" type="date"
                                            class="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-all shadow-sm">
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="text-[9px] font-black uppercase text-slate-400 ml-2">Hora sugerida</label>
                                        <input v-model="formAceptar.hora" type="time"
                                            class="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-all shadow-sm">
                                    </div>
                                </div>
                                <div class="flex gap-3">
                                    <button 
                                        type="button" 
                                        @click="turnoDetalle = null" 
                                        :disabled="isSaving || isDeleting"
                                        class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all"
                                    >
                                        Descartar
                                    </button>

                                    <button type="button" @click="aceptarDerivacion"
                                        :disabled="!formAceptar.fecha || !formAceptar.hora || isSaving || isDeleting"
                                        class="flex-[1.5] py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2">
                                        <Loader2 v-if="isSaving" class="animate-spin" :size="16" />
                                        Confirmar Cita
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div v-else class="pt-2">
                             <button 
                                type="button" 
                                @click="turnoDetalle = null" 
                                :disabled="isSaving || isDeleting"
                                class="w-full px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100 transition-all"
                            >
                                Salir del Detalle
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>

    <!-- CONFIRM DELETE MODAL (PREMIUM) -->
    <Transition name="fade">
        <div v-if="confirmDelete.visible" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                @click="isDeleting ? null : cerrarConfirmEliminar()"></div>

            <Transition name="modal-pop" appear>
                <div v-if="confirmDelete.visible && confirmDelete.turno"
                    class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative z-[160]">
                    <div class="p-8 bg-gradient-to-br from-rose-600 to-rose-700 text-white">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex items-center gap-4">
                                <div class="bg-white/15 p-3 rounded-2xl backdrop-blur-md">
                                    <ShieldAlert class="text-white" :size="22" />
                                </div>
                                <div>
                                    <p class="text-rose-100 text-[10px] font-black uppercase tracking-widest">
                                        Confirmación
                                    </p>
                                    <h3 class="text-xl font-black tracking-tight">¿Eliminar este registro?</h3>
                                </div>
                            </div>

                            <button type="button" @click="cerrarConfirmEliminar" :disabled="isDeleting"
                                class="h-10 w-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all">
                                <X :size="18" class="text-white" />
                            </button>
                        </div>

                        <p class="mt-4 text-rose-100 text-sm font-semibold leading-relaxed">
                            Esta acción no se puede deshacer. Se eliminará el turno/derivación seleccionado de la base
                            de
                            datos.
                        </p>
                    </div>

                    <div class="p-8 space-y-5">
                        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Detalle</p>
                            <p class="mt-2 text-sm font-extrabold text-slate-800">
                                {{ confirmDelete.turno?.paciente?.last_name }}, {{
                                    confirmDelete.turno?.paciente?.first_name
                                }}
                            </p>
                            <p class="mt-1 text-xs font-bold text-slate-500">
                                <span v-if="Number(confirmDelete.turno?.es_derivacion) === 1"
                                    class="text-indigo-600">Derivación</span>
                                <span v-else class="text-blue-600">Turno</span>
                                <span class="mx-2">•</span>
                                {{ confirmDelete.turno?.fecha || 'Fecha por asignar' }} {{ confirmDelete.turno?.hora ||
                                ''
                                }}
                            </p>
                        </div>

                        <div class="flex gap-3">
                            <button type="button" @click="cerrarConfirmEliminar" :disabled="isDeleting"
                                class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-60">
                                Cancelar
                            </button>

                            <button type="button" @click="confirmarEliminar" :disabled="isDeleting"
                                class="flex-[1.3] px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-60 flex items-center justify-center gap-2">
                                <Loader2 v-if="isDeleting" class="animate-spin" :size="16" />
                                <span>{{ isDeleting ? 'Eliminando' : 'Confirmar' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    </Transition>

</template>

<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount, } from 'vue';
import axios from '../api/axios';
import { useAuthStore } from '../stores/auth';
import {
    BriefcaseMedical,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    Pencil,
    Trash2,
    Loader2,
    ShieldAlert,
    X
} from 'lucide-vue-next';

const authStore = useAuthStore();

// --- LOADERS ---
const isSaving = ref(false);
const isDeleting = ref(false);

// --- LOGICA UI ---
const filtro = ref('hoy');
const tabLista = ref('turnos');
const filtroDeriv = ref('todas');

const turnosHoy = ref([]);
const turnosSemana = ref([]);
const showModalTurno = ref(false);
const tabActivo = ref('normal');
const turnoDetalle = ref(null);
const notificacion = ref({ visible: false, mensaje: '', tipo: 'success' });
const formAceptar = ref({ fecha: '', hora: '' });

// modo edición
const modoEdicion = ref(false);
const turnoEditandoId = ref(null);
const turnoEditandoEsDerivacion = ref(0);

// Confirm delete modal state
const confirmDelete = ref({
    visible: false,
    turno: null
});

const hayModalAbierto = computed(() =>
  showModalTurno.value ||
  !!turnoDetalle.value ||
  confirmDelete.value.visible
);

const cerrarTodo = () => {
  if (isSaving.value || isDeleting.value) return;
  if (confirmDelete.value.visible) {
    cerrarConfirmEliminar();
    return;
  }
  if (turnoDetalle.value) {
    turnoDetalle.value = null;
    return;
  }
  if (showModalTurno.value) {
    cerrarModal();
    return;
  }
};

const onKeydown = (e) => {
  if (e.key !== 'Escape') return;
  if (!hayModalAbierto.value) return;

  e.preventDefault();
  cerrarTodo();
};


const setTabLista = (tab) => {
    tabLista.value = tab;
    if (tab === 'turnos') {
        filtro.value = 'hoy';
    } else {
        filtroDeriv.value = 'todas';
    }
};

const mostrarToast = (msg, tipo = 'success') => {
    notificacion.value = { visible: true, mensaje: msg, tipo };
    setTimeout(() => { notificacion.value.visible = false; }, 4000);
};

const getPrioridadClass = (p) => {
    switch (p) {
        case 'baja': return 'bg-emerald-100 text-emerald-700';
        case 'media': return 'bg-amber-100 text-amber-700';
        case 'alta': return 'bg-orange-100 text-orange-700';
        case 'urgente': return 'bg-rose-500 text-white animate-pulse shadow-md';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const esEnviada = (turno) => Number(turno.user_id) === Number(authStore.user?.id);
const esRecibida = (turno) => !esEnviada(turno);

const puedeGestionarDerivacion = (turno) => {
    if (!turno || Number(turno.es_derivacion) !== 1 || turno.fecha) return false;
    return Number(turno.medico_receptor_id) === Number(authStore.user?.id);
};

const puedeEditar = (turno) => {
    if (!turno) return false;
    if (!esEnviada(turno)) return false;

    if (Number(turno.es_derivacion) === 1) {
        return !turno.fecha;
    }
    return true;
};

const puedeEliminar = (turno) => {
    if (!turno) return false;
    if (!esEnviada(turno)) return false;
    return true;
};

// --- GESTION FORMULARIO ---
const busquedaPaciente = ref('');
const resultadosPacientes = ref([]);
const pacienteSeleccionado = ref(null);
const medicos = ref([]);
const archivosSeleccionados = ref([]);

const formTurno = ref({
    paciente_id: null,
    medico_id: '',
    prioridad: 'baja',
    fecha: new Date().toISOString().substr(0, 10),
    hora: '',
    motivo: '',
});

const manejarArchivos = (event) => {
    const files = Array.from(event.target.files);
    archivosSeleccionados.value = [...archivosSeleccionados.value, ...files];
};

const medicosFiltrados = computed(() => {
    if (!authStore.user?.id || !medicos.value.length) return medicos.value;
    return medicos.value.filter(med => String(med.id) !== String(authStore.user.id));
});

// Base según filtro hoy/semana
const listaBase = computed(() => (filtro.value === 'hoy' ? turnosHoy.value : turnosSemana.value));

// Turnos normales
const turnosSolo = computed(() => {
    return listaBase.value.filter(t => Number(t.es_derivacion) !== 1);
});

// Derivaciones (enviadas/recibidas)
const derivacionesSolo = computed(() => {
    let items = listaBase.value.filter(t => Number(t.es_derivacion) === 1);

    if (filtroDeriv.value === 'enviadas') items = items.filter(t => esEnviada(t));
    if (filtroDeriv.value === 'recibidas') items = items.filter(t => esRecibida(t));

    return items;
});

// Lista final a mostrar
const listaAMostrar = computed(() => {
    return tabLista.value === 'turnos' ? turnosSolo.value : derivacionesSolo.value;
});

// --- ACCIONES API ---
const fetchAgenda = async () => {
    try {
        const { data } = await axios.get('/turnos');
        const hoyStr = new Date().toISOString().substr(0, 10);

        turnosHoy.value = data.filter(t => {
            const esDeHoy = t.fecha === hoyStr;
            const esDerivacionPendiente = Number(t.es_derivacion) === 1 && !t.fecha;
            return esDeHoy || esDerivacionPendiente;
        });

        turnosSemana.value = data;
    } catch (e) {
        console.error(e);
    }
};

const fetchMedicos = async () => {
    try {
        const { data } = await axios.get('/users?role=medico');
        medicos.value = data;
    } catch (e) {
        console.error(e);
    }
};

const verDetalleTurno = (turno) => {
    if (Number(turno.es_derivacion) === 1) {
        turnoDetalle.value = turno;
    } else {
        console.log("Atender paciente...");
    }
};

const aceptarDerivacion = async () => {
    try {
        isSaving.value = true;
        await axios.put(`/turnos/${turnoDetalle.value.id}/aceptar`, {
            fecha: formAceptar.value.fecha,
            hora: formAceptar.value.hora
        });
        turnoDetalle.value = null;
        formAceptar.value = { fecha: '', hora: '' };
        await fetchAgenda();
        mostrarToast("¡Cita agendada correctamente!");
    } catch (e) {
        mostrarToast(e.response?.data?.error || "Error al agendar", 'error');
    } finally {
        isSaving.value = false;
    }
};

// Crear o actualizar
const guardarTurno = async () => {
    if (isSaving.value) return;

    try {
        isSaving.value = true;

        const data = new FormData();
        data.append('paciente_id', formTurno.value.paciente_id);
        data.append('motivo', formTurno.value.motivo || '');

        const esDerivacionReal = tabActivo.value === 'derivacion' ? '1' : '0';
        data.append('es_derivacion', esDerivacionReal);

        if (tabActivo.value === 'normal') {
            data.append('fecha', formTurno.value.fecha);
            data.append('hora', formTurno.value.hora);
        } else {
            data.append('medico_receptor_id', formTurno.value.medico_id);
            data.append('prioridad', formTurno.value.prioridad);

            if (!modoEdicion.value) {
                archivosSeleccionados.value.forEach(file => data.append('archivos[]', file));
            }
        }

        if (!modoEdicion.value) {
            await axios.post('/turnos', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            mostrarToast(esDerivacionReal === '1' ? 'Derivación enviada' : 'Turno creado');
        } else {
            data.append('_method', 'PUT');
            await axios.post(`/turnos/${turnoEditandoId.value}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            mostrarToast('Cambios guardados');
        }

        cerrarModal();
        await fetchAgenda();
    } catch (e) {
        mostrarToast(e.response?.data?.error || "Error al guardar", 'error');
    } finally {
        isSaving.value = false;
    }
};

// Editar
const editarTurno = async (turno) => {
    modoEdicion.value = true;
    turnoEditandoId.value = turno.id;
    turnoEditandoEsDerivacion.value = Number(turno.es_derivacion) === 1 ? 1 : 0;

    tabActivo.value = Number(turno.es_derivacion) === 1 ? 'derivacion' : 'normal';

    await fetchMedicos();

    pacienteSeleccionado.value = turno.paciente || null;
    if (turno.paciente) {
        busquedaPaciente.value = `${turno.paciente.last_name.toUpperCase()}, ${turno.paciente.first_name}`;
    } else {
        busquedaPaciente.value = '';
    }

    formTurno.value = {
        paciente_id: turno.paciente_id ?? (turno.paciente?.id ?? null),
        medico_id: Number(turno.es_derivacion) === 1 ? (turno.medico_receptor_id ?? '') : '',
        prioridad: turno.prioridad || 'baja',
        fecha: turno.fecha || new Date().toISOString().substr(0, 10),
        hora: turno.hora || '',
        motivo: turno.motivo || '',
    };

    archivosSeleccionados.value = [];
    showModalTurno.value = true;
};

// --- DELETE PREMIUM ---
const abrirConfirmEliminar = (turno) => {
    confirmDelete.value = { visible: true, turno };
};

const cerrarConfirmEliminar = () => {
    if (isDeleting.value) return;
    confirmDelete.value = { visible: false, turno: null };
};

const confirmarEliminar = async () => {
    const turno = confirmDelete.value.turno;
    if (!turno || isDeleting.value) return;

    try {
        isDeleting.value = true;
        await axios.delete(`/turnos/${turno.id}`);
        cerrarConfirmEliminar();
        mostrarToast('Eliminado correctamente');
        await fetchAgenda();
    } catch (e) {
        mostrarToast(e.response?.data?.error || 'Error al eliminar', 'error');
    } finally {
        isDeleting.value = false;
    }
};

// Modal Nuevo
const abrirModalNuevo = async () => {
    modoEdicion.value = false;
    turnoEditandoId.value = null;
    turnoEditandoEsDerivacion.value = 0;

    tabActivo.value = 'normal';
    await fetchMedicos();

    showModalTurno.value = true;
};

const cerrarModal = () => {
    if (isSaving.value) return;

    showModalTurno.value = false;

    modoEdicion.value = false;
    turnoEditandoId.value = null;
    turnoEditandoEsDerivacion.value = 0;

    pacienteSeleccionado.value = null;
    busquedaPaciente.value = '';
    resultadosPacientes.value = [];
    archivosSeleccionados.value = [];

    formTurno.value = {
        paciente_id: null,
        medico_id: '',
        prioridad: 'baja',
        fecha: new Date().toISOString().substr(0, 10),
        hora: '',
        motivo: '',
    };
};

// búsqueda paciente
let timeoutBusqueda = null;

watch(busquedaPaciente, (val) => {
    if (isSaving.value) return;
    if (pacienteSeleccionado.value && val.includes(pacienteSeleccionado.value.last_name)) return;
    if (val.length < 3) { resultadosPacientes.value = []; return; }

    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(async () => {
        try {
            const { data } = await axios.get(`/pacientes?search=${val}&modal=true`);
            resultadosPacientes.value = data;
        } catch (e) {
            resultadosPacientes.value = [];
        }
    }, 400);
});

const seleccionarPaciente = (p) => {
    pacienteSeleccionado.value = p;
    busquedaPaciente.value = `${p.last_name.toUpperCase()}, ${p.first_name}`;
    formTurno.value.paciente_id = p.id;
    resultadosPacientes.value = [];
};

onMounted(fetchAgenda);
onMounted((fetchAgenda) => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.toast-enter-active {
    animation: slide-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
    animation: slide-in 0.4s reverse ease-in;
}

@keyframes slide-in {
    from {
        transform: translateX(100%) scale(0.9);
        opacity: 0;
    }

    to {
        transform: translateX(0) scale(1);
        opacity: 1;
    }
}


.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}


.modal-pop-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
    transition: all 0.25s ease-in;
}

.modal-pop-enter-from {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
}

.modal-pop-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
}


.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}

.fixed {
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
}


select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
}
</style>
