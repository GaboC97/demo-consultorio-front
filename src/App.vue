<template>
  <div v-if="auth.isLoggedIn" class="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
    
    <Sidebar @logout="handleLogout" />

    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      
      <Header :user="auth.user" />

      <div class="flex-1 overflow-y-auto">
        <router-view />
      </div>

    </main>
  </div>

  <router-view v-else />
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>