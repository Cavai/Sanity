import Vue from "vue";
import Vuex from "vuex";

import createPersistedState from "vuex-persistedstate";

import SecureLS from "secure-ls";
const ls = new SecureLS({ isCompression: true });

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [
    createPersistedState({
      storage: {
        getItem: (key) => ls.get(key),
        setItem: (key, value) => ls.set(key, value),
        removeItem: (key) => ls.remove(key),
      },
    }),
  ],
  state: {
    user: null,
    userAuthenticated: false,
    authenticationToken: "",
    firebaseInstance: null,
    expiryDate: new Date(),
    cachedUsers: null,
    cachedRepositories: null,
    cachedPullRequests: null,
    cachedIssues: null,
    cachedLogo: null,
  },
  getters: {
    isExpired: (state) => new Date(state.expiryDate) < new Date(),
  },
  mutations: {
    authenticateUser: (state, user) => {
      state.userAuthenticated = true;
      state.user = user;
    },
    logoutUser: (state) => {
      state.user = null;
      state.userAuthenticated = false;
      state.authenticationToken = "";
      state.firebaseInstance = null;
      state.cachedUsers = null;
      state.cachedRepositories = null;
      state.cachedPullRequests = null;
      state.cachedIssues = null;

      sessionStorage.removeItem("cachedCommits");
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
    setCachedUsers: (state, users) => {
      state.cachedUsers = users;
    },
    setCachedRepositories: (state, repos) => {
      state.cachedRepositories = repos;
    },
    setCachedPulls: (state, pulls) => {
      state.cachedPullRequests = pulls;
    },
    setCachedIssues: (state, issues) => {
      state.cachedIssues = issues;
    },
    setCachedLogo: (state, logo) => {
      state.cachedLogo = logo;
    }
  },
});
