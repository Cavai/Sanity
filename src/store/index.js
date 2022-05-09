import Vue from 'vue';
import Vuex from 'vuex';

import createPersistedState from 'vuex-persistedstate';

import SecureLS from 'secure-ls';
const ls = new SecureLS({ isCompression: false });

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: key => ls.remove(key)
      }
    })
  ],
  state: {
    user: null,
    userAuthenticated: false,
    authenticationToken: '',
    firebaseInstance: null,
  },
  mutations: {
    authenticateUser: (state, user) => {
      state.userAuthenticated = true;
      state.user = user;
    },
    logoutUser: state => {
      state.user = null;
      state.userAuthenticated = false;
      state.authenticationToken = '';
      state.firebaseInstance = null;
    },
    setToken: (state, token) => {
      state.authToken = token;
    },
    setFirebaseInstance: (state, instance) => {
      state.firebaseInstance = instance;
    },
  }
});
