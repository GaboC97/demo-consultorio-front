<template>
    <div v-if="paciente" class="p-6 md:p-8 max-w-6xl mx-auto">
        <!-- volver -->
        <div class="mb-6 no-print">
            <button @click="$router.back()"
                class="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[11px] uppercase tracking-widest transition-colors group">
                <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                Volver al listado
            </button>
        </div>

        <!-- toast -->
        <Transition name="toast">
            <div v-if="mensajeExito"
                class="fixed top-5 right-5 z-[200] bg-emerald-600/90 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-emerald-500 backdrop-blur-md">
                <span>✅</span>
                <span class="font-black text-[11px] uppercase tracking-widest">{{ mensajeExito }}</span>
            </div>
        </Transition>

        <!-- HEADER PREMIUM -->
        <div
            class="relative overflow-hidden rounded-[2.5rem] border border-white shadow-[0_20px_70px_-15px_rgba(30,58,138,0.15)]">
            <div class="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950"></div>
            <div class="absolute -top-20 -right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
            <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>

            <div class="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div class="flex items-center gap-5">
                    <div
                        class="h-14 w-14 rounded-[1.5rem] bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-lg">
                        {{ inicialesPaciente }}
                    </div>

                    <div>
                        <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                            Ficha del Paciente
                        </p>
                        <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                            {{ paciente.last_name }}, {{ paciente.first_name }}
                        </h1>

                        <div class="mt-3 flex flex-wrap gap-2">
                            <span
                                class="px-3 py-1.5 rounded-2xl bg-black/20 border border-white/10 text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
                                DNI: <span class="text-white/90 font-black">{{ paciente.dni }}</span>
                            </span>
                            <span
                                class="px-3 py-1.5 rounded-2xl bg-black/20 border border-white/10 text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
                                Edad: <span class="text-white/90 font-black">{{ calcularEdad(paciente.birth_date)
                                }}</span>
                            </span>
                            <span v-if="paciente.social_security"
                                class="px-3 py-1.5 rounded-2xl bg-black/20 border border-white/10 text-blue-100/80 text-[10px] font-black uppercase tracking-widest">
                                Obra Social: <span class="text-white/90 font-black">{{ paciente.social_security
                                }}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="no-print inline-flex items-center gap-4 px-5 py-4
         rounded-[1.75rem] bg-white/10 border border-white/10
         hover:bg-white/15 transition-all active:scale-[0.98]">
                        <div class="text-left">
                            <p class="text-blue-200/60 text-[9px] font-black uppercase tracking-[0.35em]">
                                Grupo sanguíneo
                            </p>
                            <p class="text-white text-xl font-black leading-none">
                                {{ paciente.blood_type || 'N/A' }}
                            </p>
                        </div>
                    </div>


                    <button @click="openNewConsulta()"
                        class="no-print inline-flex items-center gap-2 px-6 py-5 rounded-[1.75rem] bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-emerald-900/20 hover:bg-emerald-700 active:scale-[0.98] transition-all">
                        + Nueva Consulta
                    </button>
                </div>
            </div>

            <div class="relative z-10 px-10 pb-8">
                <div class="h-px bg-white/10"></div>
            </div>
        </div>

        <!-- CONTENIDO -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            <!-- SIDEBAR -->
            <aside class="lg:col-span-1 space-y-6">
                <!-- Alergias -->
                <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div class="px-6 py-5 bg-amber-50/30 border-b border-amber-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">⚠️</span>
                            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">Alergias</h3>
                        </div>
                        <button @click="abrirEditor('allergies')"
                            class="no-print px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-white border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all">
                            Editar
                        </button>
                    </div>

                    <div class="p-6">
                        <div v-if="paciente.allergies?.length" class="flex flex-wrap gap-2">
                            <span v-for="a in paciente.allergies" :key="a.id"
                                class="px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-amber-50 border border-amber-100 text-amber-700">
                                {{ a.name }}
                            </span>
                        </div>
                        <p v-else class="text-[11px] text-slate-400 font-bold italic">Ninguna registrada</p>
                    </div>
                </div>

                <!-- Patologías -->
                <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div class="px-6 py-5 bg-rose-50/30 border-b border-rose-100 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">📋</span>
                            <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-rose-700">Patologías</h3>
                        </div>
                        <button @click="abrirEditor('pathologies')"
                            class="no-print px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all">
                            Editar
                        </button>
                    </div>

                    <div class="p-6">
                        <div v-if="paciente.pathologies?.length" class="flex flex-wrap gap-2">
                            <span v-for="p in paciente.pathologies" :key="p.id"
                                class="px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-700">
                                {{ p.name }}
                            </span>
                        </div>
                        <p v-else class="text-[11px] text-slate-400 font-bold italic">Sin antecedentes</p>
                    </div>
                </div>

                <!-- Acciones rápidas -->
                <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 no-print">
                    <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Acciones</h4>
                    <div class="flex flex-col gap-3">
                        <button @click="showPatientDetails = true"
                            class="px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
                            Datos del paciente
                        </button>

                        <button @click="imprimirFicha"
                            class="px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all">
                            Imprimir ficha
                        </button>
                    </div>
                </div>
            </aside>

            <!-- HISTORIAL -->
            <section class="lg:col-span-3">
                <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Historial</p>
                            <h3 class="text-lg font-black text-slate-800">Consultas médicas</h3>
                        </div>
                    </div>

                    <div class="p-8">
                        <div v-if="!paciente.consultations?.length" class="text-center py-16">
                            <div class="text-4xl mb-3">🗂️</div>
                            <p class="text-slate-500 font-bold">Aún no hay consultas registradas.</p>
                            <p class="text-[11px] text-slate-400 mt-2">Cuando cargues una consulta, aparecerá en este
                                historial.</p>
                        </div>

                        <div v-else class="space-y-6">
                            <div v-for="consulta in paciente.consultations" :key="consulta.id" class="relative pl-8">
                                <div class="absolute left-2 top-6 bottom-0 w-px bg-slate-200"></div>
                                <div
                                    class="absolute left-0 top-5 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-md">
                                </div>

                                <div class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                                    <div
                                        class="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between gap-4">
                                        <div>
                                            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                                {{ formatearFecha(consulta.created_at) }}
                                            </p>
                                            <h4 class="text-slate-800 font-black mt-1">
                                                Motivo: <span class="font-bold">{{ consulta.reason }}</span>
                                            </h4>
                                        </div>

                                        <button @click="descargarPDF(consulta.id)"
                                            class="no-print text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:underline">
                                            📄 Descargar receta
                                        </button>
                                    </div>

                                    <div class="p-6 space-y-4">
                                        <div class="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5">
                                            <p
                                                class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                                Diagnóstico / Evolución</p>
                                            <p class="text-slate-700 text-sm leading-relaxed italic">
                                                {{ consulta.diagnosis }}
                                            </p>
                                        </div>

                                        <div class="bg-blue-50 border border-blue-100 rounded-[1.5rem] p-5">
                                            <p
                                                class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">
                                                Tratamiento</p>
                                            <p class="text-blue-900 text-sm leading-relaxed">
                                                {{ consulta.treatment }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="pt-2">
                                <p class="text-[11px] text-slate-400 font-bold">
                                    Total de consultas: <span class="text-slate-700">{{ paciente.consultations.length
                                    }}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- MODAL DETALLES PACIENTE (NUEVO) -->
        <Transition name="modal-fade">
            <div v-if="showPatientDetails" class="fixed inset-0 z-[190] flex items-center justify-center p-4"
                @click.self="showPatientDetails = false">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                <Transition name="modal-pop" appear>
                    <div class="w-full max-w-2xl relative z-[200]" @click.stop>
                        <div
                            class="bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]">
                            <!-- header modal -->
                            <div
                                class="relative px-8 pt-10 pb-8 overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950">
                                <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl">
                                </div>

                                <div class="flex items-center justify-between gap-6">
                                    <div>
                                        <p
                                            class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                            Información completa
                                        </p>
                                        <h3 class="text-2xl font-black text-white tracking-tight uppercase">
                                            {{ paciente.last_name }}, {{ paciente.first_name }}
                                        </h3>
                                        <p
                                            class="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-2">
                                            DNI {{ paciente.dni }} • {{ calcularEdad(paciente.birth_date) }}
                                        </p>
                                    </div>

                                    <button @click="showPatientDetails = false"
                                        class="no-print px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-all">
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                            <!-- body modal -->
                            <div class="p-10 pt-10 overflow-y-auto bg-white">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div class="bg-slate-50 border border-slate-100 rounded-[1.75rem] p-6">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                            Correo</p>
                                        <p class="text-slate-800 font-black break-all">
                                            {{ paciente.email || '—' }}
                                        </p>
                                    </div>

                                    <div class="bg-slate-50 border border-slate-100 rounded-[1.75rem] p-6">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                            Teléfono</p>
                                        <p class="text-slate-800 font-black">
                                            {{ paciente.phone || '—' }}
                                        </p>
                                    </div>

                                    <div class="bg-slate-50 border border-slate-100 rounded-[1.75rem] p-6">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                            Fecha de nacimiento</p>
                                        <p class="text-slate-800 font-black">
                                            {{ formatearFechaNacimiento(paciente.birth_date) }}
                                        </p>
                                    </div>

                                    <div class="bg-slate-50 border border-slate-100 rounded-[1.75rem] p-6">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                            Género</p>
                                        <p class="text-slate-800 font-black">
                                            {{ formatearGenero(paciente.gender) }}
                                        </p>
                                    </div>

                                    <div class="bg-blue-50 border border-blue-100 rounded-[1.75rem] p-6 md:col-span-2">
                                        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">
                                            Obra social / Prepaga</p>
                                        <p class="text-blue-900 font-black">
                                            {{ paciente.social_security || '—' }}
                                        </p>
                                    </div>

                                    <div
                                        class="bg-indigo-50 border border-indigo-100 rounded-[1.75rem] p-6 md:col-span-2">
                                        <p
                                            class="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-2">
                                            Grupo sanguíneo</p>
                                        <p class="text-indigo-900 font-black">
                                            {{ paciente.blood_type || '—' }}
                                        </p>
                                    </div>
                                </div>

                                <!-- tip -->
                                <div class="mt-8 bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
                                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                                        Nota</p>
                                    <p class="text-[11px] text-slate-500 font-bold">
                                        Si querés, acá después podemos sumar botones rápidos: “Copiar mail”, “Copiar
                                        teléfono”, o “Ir a editar paciente”.
                                    </p>
                                </div>
                            </div>

                            <!-- footer modal -->
                            <div class="p-8 bg-slate-50/50 flex items-center gap-5 border-t border-slate-100">
                                <button type="button" @click="showPatientDetails = false"
                                    class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-rose-600 transition-all">
                                    Cerrar
                                </button>
                                <button type="button" @click="imprimirFicha"
                                    class="flex-[1.5] bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl bg-indigo-900 shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all">
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>

        <!-- MODAL NUEVA CONSULTA (premium) -->
        <Transition name="modal-fade">
            <div v-if="showModal" class="fixed absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[180] flex items-center justify-center p-4"
                @click.self="showModal = false">
                <!-- BACKDROP (igual al otro) -->
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                <!-- glow suave arriba del backdrop (hace que se sienta igual “premium”) -->
                <div class="pointer-events-none absolute inset-0
             bg-gradient-to-b from-white/5 via-transparent to-black/10"></div>

                <Transition name="modal-pop" appear>
                    <div class="w-full max-w-2xl relative z-[190]" @click.stop>
                        <div class="bg-white rounded-[2.5rem] shadow-2xl border border-white
                 overflow-hidden flex flex-col max-h-[90vh]">
                            <div class="px-8 pt-10 pb-8 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950
                   relative overflow-hidden">
                                <div class="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl">
                                </div>
                                <div
                                    class="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl">
                                </div>

                                <p class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                    Nueva consulta
                                </p>
                                <h3 class="text-2xl font-black text-white tracking-tight">
                                    Registrar evolución médica
                                </h3>
                                <p class="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mt-2">
                                    {{ paciente.last_name }}, {{ paciente.first_name }} • DNI {{ paciente.dni }}
                                </p>
                            </div>

                            <div class="p-10 pt-12 overflow-y-auto bg-white">
                                <div class="space-y-6">
                                    <div>
                                        <label
                                            class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                                            Motivo
                                        </label>
                                        <input v-model="nuevaConsulta.reason" type="text"
                                            placeholder="Ej: Control, dolor, fiebre..." class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl
                         focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none
                         font-bold text-sm transition-all" />
                                    </div>

                                    <div>
                                        <label
                                            class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                                            Diagnóstico / Evolución
                                        </label>
                                        <textarea v-model="nuevaConsulta.diagnosis" rows="5"
                                            placeholder="Escriba la evolución..." class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl
                         focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none
                         font-bold text-sm transition-all"></textarea>
                                    </div>

                                    <div>
                                        <label
                                            class="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">
                                            Tratamiento indicado
                                        </label>
                                        <textarea v-model="nuevaConsulta.treatment" rows="4"
                                            placeholder="Indicación / receta / recomendaciones..." class="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl
                         focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none
                         font-bold text-sm transition-all"></textarea>
                                    </div>

                                    <p v-if="errorNuevaConsulta"
                                        class="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                                        ⚠️ {{ errorNuevaConsulta }}
                                    </p>
                                </div>
                            </div>

                            <div class="p-8 bg-slate-50/50 flex items-center gap-5 border-t border-slate-100">
                                <button type="button" @click="showModal = false" :disabled="enviando" class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]
                     text-slate-400 hover:text-white hover:bg-rose-600 transition-all disabled:opacity-40">
                                    Cancelar
                                </button>

                                <button @click="guardarConsulta" :disabled="enviando" class="flex-[1.5] bg-emerald-600 text-white px-4 py-4 rounded-2xl font-black text-[11px]
                     uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700
                     active:scale-[0.98] transition-all disabled:opacity-30">
                                    {{ enviando ? 'Guardando...' : 'Finalizar consulta' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>


        <!-- MODAL EDITAR BACK -->
        <Transition name="modal-fade">
            <div v-if="showEditBack" class="fixed inset-0 z-[180] flex items-center justify-center p-4"
                @click.self="showEditBack = false">
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                <!-- MODAL EDITAR BACK (PREMIUM) -->
                <Transition name="modal-fade">
                    <div v-if="showEditBack" class="fixed inset-0 z-[180] flex items-center justify-center p-4"
                        @click.self="showEditBack = false">
                        <!-- backdrop -->
                        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

                        <Transition name="modal-pop" appear>
                            <div class="w-full max-w-md relative z-[190]" @click.stop>
                                <div class="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(30,58,138,0.20)]
                 border border-white overflow-hidden">
                                    <!-- header premium -->
                                    <div
                                        class="relative px-8 pt-10 pb-10 overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950">
                                        <div
                                            class="absolute -top-10 -right-10 w-44 h-44 bg-blue-400/10 rounded-full blur-3xl">
                                        </div>
                                        <div
                                            class="absolute -bottom-14 -left-14 w-56 h-56 bg-indigo-400/10 rounded-full blur-3xl">
                                        </div>

                                        <div class="relative z-10 text-center">
                                            <div class="w-14 h-14 bg-white/10 border border-white/10 rounded-[1.75rem]
                       flex items-center justify-center mx-auto mb-4 text-2xl backdrop-blur-md shadow-inner">
                                                <span class="text-white">{{ editType === 'allergies' ? '⚠️' : '📋'
                                                }}</span>
                                            </div>

                                            <p
                                                class="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                                                Ajustes de historia clínica
                                            </p>

                                            <h2 class="text-xl font-black text-white tracking-tight">
                                                Editar {{ editType === 'allergies' ? 'Alergias' : 'Patologías' }}
                                            </h2>

                                            <p class="text-blue-100/60 text-[11px] font-bold mt-2">
                                                Seleccione los elementos correspondientes.
                                            </p>
                                        </div>

                                        <!-- fade suave al body -->
                                        <div
                                            class="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white/10 pointer-events-none">
                                        </div>
                                    </div>

                                    <!-- body -->
                                    <div class="p-6">
                                        <div class="max-h-72 overflow-y-auto custom-scrollbar pr-2">
                                            <label v-for="item in opcionesDisponibles" :key="item.id" class="group flex items-center gap-3 p-3 rounded-2xl cursor-pointer
                       hover:bg-blue-50 transition-colors">
                                                <input type="checkbox" :value="item.id" v-model="seleccionados"
                                                    class="w-5 h-5 rounded text-blue-600 border-slate-300" />
                                                <span
                                                    class="text-slate-700 font-bold text-sm group-hover:text-blue-700">
                                                    {{ item.name }}
                                                </span>
                                            </label>

                                            <div v-if="!opcionesDisponibles?.length" class="py-10 text-center">
                                                <p class="text-slate-400 font-bold text-sm">No hay opciones para
                                                    mostrar.</p>
                                            </div>
                                        </div>

                                        <!-- helper -->
                                        <div class="mt-5 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                                            <p
                                                class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                                Seleccionados:
                                                <span class="text-slate-700">{{ seleccionados.length }}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <!-- footer premium -->
                                    <div class="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
                                        <button type="button" @click="showEditBack = false" class="flex-1 px-4 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em]
                     text-slate-400 hover:text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-100
                     transition-all active:scale-[0.98]">
                                            Cerrar
                                        </button>

                                        <button type="button" @click="guardarCambiosBack" class="flex-[1.2] bg-blue-600 text-white px-4 py-4 rounded-2xl font-black text-[11px]
                     uppercase tracking-[0.2em] shadow-xl bg-indigo-900 shadow-indigo-200 hover:bg-indigo-700
                     active:scale-[0.98] transition-all">
                                            Aplicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </Transition>

            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from '../api/axios';

const route = useRoute();
const paciente = ref(null);
const mensajeExito = ref('');

// UI
const showModal = ref(false);
const showEditBack = ref(false);
const showPatientDetails = ref(false);
const enviando = ref(false);
const errorNuevaConsulta = ref('');

const editType = ref('');
const seleccionados = ref([]);
const opcionesDisponibles = ref([]);

const nuevaConsulta = ref({ reason: '', diagnosis: '', treatment: '' });

const notify = (msg) => {
    mensajeExito.value = msg;
    setTimeout(() => (mensajeExito.value = ''), 3000);
};

const inicialesPaciente = computed(() => {
    if (!paciente.value) return 'P';
    const ln = (paciente.value.last_name || '').trim();
    const fn = (paciente.value.first_name || '').trim();
    return `${ln[0] || 'P'}${fn[0] || ''}`.toUpperCase();
});

const cargarFicha = async () => {
    try {
        const response = await axios.get(`/pacientes/${route.params.id}`);
        paciente.value = response.data.data;
    } catch (error) {
        console.error(error);
    }
};

const openNewConsulta = () => {
    errorNuevaConsulta.value = '';
    showModal.value = true;
};

const guardarConsulta = async () => {
    errorNuevaConsulta.value = '';
    if (!nuevaConsulta.value.reason || !nuevaConsulta.value.diagnosis || !nuevaConsulta.value.treatment) {
        errorNuevaConsulta.value = 'Complete motivo, diagnóstico y tratamiento.';
        return;
    }

    enviando.value = true;
    try {
        await axios.post('/consultas', { ...nuevaConsulta.value, patient_id: route.params.id });
        showModal.value = false;
        nuevaConsulta.value = { reason: '', diagnosis: '', treatment: '' };
        notify('Consulta registrada con éxito');
        await cargarFicha();
    } catch (error) {
        console.error(error);
        errorNuevaConsulta.value = error.response?.data?.message || 'Error al guardar la consulta';
    } finally {
        enviando.value = false;
    }
};

const abrirEditor = async (type) => {
    editType.value = type;
    try {
        const endpoint = type === 'allergies' ? '/alergias' : '/patologias';
        const res = await axios.get(endpoint);

        opcionesDisponibles.value = res.data.data ?? res.data;

        seleccionados.value =
            type === 'allergies'
                ? (paciente.value.allergies || []).map((a) => a.id)
                : (paciente.value.pathologies || []).map((p) => p.id);

        showEditBack.value = true;
    } catch (error) {
        console.error(error);
    }
};

const guardarCambiosBack = async () => {
    try {
        const payload = {};
        payload[editType.value] = seleccionados.value;
        await axios.post(`/pacientes/${paciente.value.id}/background`, payload);
        showEditBack.value = false;
        notify(`${editType.value === 'allergies' ? 'Alergias' : 'Patologías'} actualizadas`);
        await cargarFicha();
    } catch (error) {
        console.error(error);
    }
};

const calcularEdad = (f) => {
    if (!f) return '--';
    const hoy = new Date();
    const cumple = new Date(f);
    let e = hoy.getFullYear() - cumple.getFullYear();
    if (
        hoy.getMonth() < cumple.getMonth() ||
        (hoy.getMonth() === cumple.getMonth() && hoy.getDate() < cumple.getDate())
    ) e--;
    return e + ' años';
};

const formatearFecha = (s) =>
    new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

const formatearFechaNacimiento = (f) => {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatearGenero = (g) => {
    if (!g) return '—';
    if (g === 'M') return 'Masculino';
    if (g === 'F') return 'Femenino';
    if (g === 'X') return 'Otro / X';
    return g;
};

const descargarPDF = async (id) => {
    try {
        const res = await axios.get(`/consultas/${id}/pdf`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receta_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
    } catch (e) {
        console.error(e);
    }
};

const imprimirFicha = () => window.print();

onMounted(cargarFicha);
</script>

<style scoped>
@media print {
    .no-print {
        display: none !important;
    }
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

/* Scrollbar */
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
</style>
