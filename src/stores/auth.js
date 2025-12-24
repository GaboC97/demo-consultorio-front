import { defineStore } from 'pinia';
import axios from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }

    return {
      user: (savedUser && savedUser !== "undefined") ? JSON.parse(savedUser) : null,
      token: savedToken || null,
    };
  },

getters: {
  isLoggedIn: (state) => !!state.token,
  userId: (state) => state.user?.id || state.user?.usuario_id || null, 
  medicoInfo: (state) => state.user ? 
    { mn: state.user.mn, mp: state.user.mp, nombre: state.user.nombre } : null
},

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/login', credentials);
        this.token = response.data.access_token;
        this.user = response.data.usuario;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        
        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  }
});