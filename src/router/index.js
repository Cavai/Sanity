import Vue from "vue";
import VueRouter from "vue-router";

import store from "../store/index";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Login.vue"),
    beforeEnter: (to, from, next) => {
      if (!store.state.userAuthenticated || store.getters.isExpired) {
        next();
      } else {
        next({
          path: "/requests",
        });
      }
    },
  },
  {
    path: "/requests",
    name: "Requests",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Requests.vue"),
    props: true,
    beforeEnter: (to, from, next) => {
      if (!store.state.userAuthenticated || store.getters.isExpired) {
        next({
          path: "/",
          query: { to: "requests" },
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/stream",
    name: "Stream",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Stream.vue"),
    props: true,
    beforeEnter: (to, from, next) => {
      if (!store.state.userAuthenticated || store.getters.isExpired) {
        next({
          path: "/",
          query: { to: "stream" },
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/horizon",
    name: "Horizon",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Horizon.vue"),
    props: true,
    beforeEnter: (to, from, next) => {
      if (!store.state.userAuthenticated || store.getters.isExpired) {
        next({
          path: "/",
          query: { to: "horizon" },
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/utils",
    name: "Utils",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Utils.vue"),
    props: true,
    beforeEnter: (to, from, next) => {
      if (!store.state.userAuthenticated || store.getters.isExpired) {
        next({
          path: "/",
          query: { to: "utils" },
        });
      } else {
        next();
      }
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
