import { defineStore } from 'pinia';
import axios from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Recuperamos los datos de forma segura
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    // Si hay un token guardado, lo configuramos por defecto en Axios de una vez
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    return {
      // Solo parseamos si existe el dato y es un JSON válido (no "undefined")
      user: (savedUser && savedUser !== "undefined") ? JSON.parse(savedUser) : null,
      token: savedToken || null,
    };
  },

getters: {
  isLoggedIn: (state) => !!state.token,
  // Asegurémonos de capturar el ID correctamente
  userId: (state) => state.user?.id || state.user?.usuario_id || null, 
  medicoInfo: (state) => state.user ? 
    { mn: state.user.mn, mp: state.user.mp, nombre: state.user.nombre } : null
},

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/login', credentials);
        
        // El Back devuelve 'access_token' y el objeto 'usuario'
        this.token = response.data.access_token;
        this.user = response.data.usuario;
        
        // Guardamos en LocalStorage para persistencia
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        // Configuramos el token para todas las futuras peticiones de Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        return true;
      } catch (error) {
        // Limpiamos en caso de error para evitar estados corruptos
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Quitamos el header de autorización
      delete axios.defaults.headers.common['Authorization'];
    }
  }
});