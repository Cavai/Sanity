import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

// UI Framework (https://www.iviewui.com/)
import ViewUI from 'view-design';
import locale from 'view-design/dist/locale/en-US';
import 'view-design/dist/styles/iview.css';

import Trend from 'vuetrend';

import '@/styles/main.scss';

import VueJWT from 'vuejs-jwt';

Vue.use(ViewUI, { locale });
Vue.use(Trend);
Vue.use(VueJWT);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
