import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Login from "../views/LoginView.vue";
import Dashboard from "../views/DashboardView.vue";
import PatientsList from "../views/PatientsListView.vue";
import PatientDetail from "../views/PatientDetailView.vue";
import Turnos from "../views/TurnosView.vue";
import ChatView from "../views/ChatView.vue";
import MensajesInbox from "../views/MensajesInboxView.vue";
const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true }, // Solo para gente NO logueada
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/pacientes",
    name: "PatientsList",
    component: PatientsList,
    meta: { requiresAuth: true },
  },
  {
    path: "/pacientes/:id",
    name: "PatientDetail",
    component: PatientDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/turnos",
    name: "Turnos",
    component: Turnos,
    meta: { requiresAuth: true },
  },
  {
    path: "/mensajes/:id",
    name: "Chat",
    component: ChatView,
    meta: { requiresAuth: true },
    props: true,
  },

  {
    path: "/mensajes",
    name: "Mensajes",
    component: MensajesInbox,
    meta: { requiresAuth: true },
  },
  // Captura de rutas inexistentes (404)
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * GUARDIA DE SEGURIDAD GLOBAL
 */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // Caso 1: La ruta requiere autenticación y el médico no está logueado
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: "Login" });
  }

  // Caso 2: El médico ya está logueado e intenta ir al Login
  if (to.meta.requiresGuest && auth.isLoggedIn) {
    return next({ name: "Dashboard" });
  }

  // Caso 3: Todo está en orden, procedemos
  next();
});

export default router;
