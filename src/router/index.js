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
  },
  {
    path: "/home",
    name: "Home",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Home.vue"),
    props: true,
  },
  {
    path: "/requests",
    name: "Requests",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Requests.vue"),
    props: true,
  },
  {
    path: "/stream",
    name: "Stream",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Stream.vue"),
    props: true,
  },
  {
    path: "/horizon",
    name: "Horizon",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Horizon.vue"),
    props: true,
  },
  {
    path: "/horizon/:engineer",
    name: "Horizon +user",
    component: () =>
      import(/* webpackChunkName: "horizon" */ "../views/Horizon.vue"),
    props: true,
  },
  {
    path: "/utils",
    name: "Utils",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Utils.vue"),
    props: true,
  },
  {
    path: "/utils/access",
    name: "Access",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Apps/Access.vue"),
    props: true,
  },
  {
    path: "/utils/labels",
    name: "Labels",
    component: () =>
      import(/* webpackChunkName: "start" */ "../views/Apps/Labels.vue"),
    props: true,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeResolve((to, from, next) => {
  if (!store.state.userAuthenticated || store.getters.isExpired) {
    store.commit("logoutUser");

    if (to.path === "/") {
      next();
      return;
    }

    next({
      path: "/",
      query: { to: to.path.substring(1) },
    });

  } else {
    if (to.path === "/") {
      next({
        path: "/home",
      });
      return;
    }

    next();

    return;
  }
});

export default router;
