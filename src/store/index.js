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
    expiryDate: new Date(),
    cachedRepositories: null,
    cachedPullRequests: null,
    cachedIssues: null,
  },
  getters: {
    isExpired: state => (new Date(state.expiryDate) < new Date()),
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
      state.cachedRepositories = null;
      state.cachedPullRequests = null;
      state.cachedIssues = null;
    },
    setToken: (state, token) => {
      state.authenticationToken = token;
    },
    setFirebaseInstance: (state, instance) => {
      state.firebaseInstance = instance;
    },
    setExpiryDate: (state) => {
      const date = new Date();
      date.setDate(date.getDate() + 1); // 24hrs
      state.expiryDate = date;
    },
    setCachedRepositories: (state, repos) => {
      state.cachedRepositories = repos;
    },
    setCachedPulls: (state, pulls) => {
      state.cachedPullRequests = pulls;
    },
    setCachedIssues: (state, issues) => {
      state.cachedIssues = issues;
    }
  }
});
