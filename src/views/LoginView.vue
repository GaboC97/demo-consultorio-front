<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
          <span class="text-3xl">🏥</span>
        </div>
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Sistema Médico</h2>
        <p class="text-gray-500 mt-2 font-medium">Gestión de Matrículas y Pacientes</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-10 border border-white">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Profesional</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                📧
              </span>
              <input 
                v-model="form.email" 
                type="email" 
                required 
                placeholder="doctor@clinica.com"
                class="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
            <div class="relative group">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                🔒
              </span>
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                required 
                placeholder="••••••••"
                class="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-700 font-medium"
              >
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                <span v-if="!showPassword">👁️</span>
                <span v-else>🕶️</span>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between py-2">
            <label class="flex items-center cursor-pointer group">
              <input 
                v-model="rememberMe" 
                type="checkbox" 
                class="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
              <span class="ml-3 text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">Recuérdame</span>
            </label>
          </div>

          <button 
            type="submit" 
            :disabled="cargando"
            class="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <template v-if="!cargando">
              Entrar al Sistema
            </template>
            <template v-else>
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Autenticando...
            </template>
          </button>
        </form>
      </div>

      <p class="text-center mt-8 text-sm text-gray-400 font-medium">
        Uso exclusivo para personal médico autorizado.<br>
        <span class="text-xs uppercase mt-2 block tracking-tighter">Matrícula Nacional y Provincial Requerida</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const form = ref({ email: '', password: '' });
const cargando = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);

// Cargar email si se recordó anteriormente
onMounted(() => {
  const savedEmail = localStorage.getItem('remembered_email');
  if (savedEmail) {
    form.value.email = savedEmail;
    rememberMe.value = true;
  }
});

const handleLogin = async () => {
  cargando.value = true;
  try {
    await auth.login(form.value);
    
    // Lógica de Recordarme
    if (rememberMe.value) {
      localStorage.setItem('remembered_email', form.value.email);
    } else {
      localStorage.removeItem('remembered_email');
    }

    router.push('/dashboard');
  } catch (error) {
    alert('Error al iniciar sesión. Verificá tus credenciales profesional.');
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Transición suave para el foco de los inputs */
input {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>