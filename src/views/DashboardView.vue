<template>
  <div class="p-10 max-w-7xl mx-auto w-full">
    
    <div class="mb-12">
      <h2 class="text-5xl font-black text-slate-900 tracking-tight leading-none">
        ¡Hola, <span class="text-blue-600">Dr. {{ auth.user?.nombre }}!</span> 👋
      </h2>
      <p class="text-slate-500 font-semibold text-lg mt-3">Aquí tienes un resumen de tu actividad de hoy.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div v-for="(stat, idx) in dashboardStats" :key="idx" 
           class="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 group">
        <div :class="[stat.color, 'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm mb-4']">
          <span class="text-xl">{{ stat.icon }}</span>
        </div>
        <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{{ stat.label }}</p>
        <h3 v-if="!loadingStats" class="text-3xl font-black text-slate-800 tracking-tighter">{{ stat.value }}</h3>
        <div v-else class="h-9 w-20 bg-slate-50 animate-pulse rounded-lg mt-1"></div>
      </div>
    </div>

    <div class="max-w-3xl"> 
      <div class="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-8">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl font-black text-slate-800">Actividad del Consultorio</h3>
          <span class="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Reciente</span>
        </div>
        
        <div class="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-50">
          <div v-for="item in actividadReciente" :key="item.id" class="flex items-start gap-5 relative z-10">
            <div class="w-10 h-10 rounded-2xl bg-white border-2 border-slate-50 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">
              {{ item.iniciales }}
            </div>
            <div class="pt-1">
              <p class="text-sm font-black text-slate-800 tracking-tight leading-none">{{ item.paciente }}</p>
              <p class="text-[11px] text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                {{ item.accion }} <span class="opacity-40">•</span> {{ item.tiempo }}
              </p>
            </div>
          </div>
          
          <div v-if="actividadReciente.length === 0 && !loadingStats" class="text-center py-10">
            <div class="text-4xl mb-3 opacity-20">📂</div>
            <p class="text-slate-300 text-xs font-bold uppercase tracking-widest">Sin movimientos recientes</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import axios from '../api/axios';

const auth = useAuthStore();
const loadingStats = ref(true);
const actividadReciente = ref([]);

const dashboardStats = ref([
  { label: 'Total Pacientes', value: '0', icon: '👥', color: 'bg-blue-50 text-blue-600', key: 'total_pacientes' },
  { label: 'Consultas del Mes', value: '0', icon: '📅', color: 'bg-green-50 text-green-600', key: 'consultas_mes' },
  { label: 'Nuevos (7 días)', value: '0', icon: '📈', color: 'bg-purple-50 text-purple-600', key: 'nuevos_pacientes' },
  { label: 'Pendientes Hoy', value: '0', icon: '⏳', color: 'bg-orange-50 text-orange-600', key: 'pendientes' },
]);

const fetchDashboardData = async () => {
  loadingStats.value = true;
  try {
    const { data } = await axios.get('/dashboard/stats');
    
    dashboardStats.value.forEach(stat => {
      if (data.stats && data.stats[stat.key] !== undefined) {
        stat.value = data.stats[stat.key];
      }
    });

    actividadReciente.value = data.recientes || [];
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
  } finally {
    loadingStats.value = false;
  }
};

onMounted(fetchDashboardData);
</script>