import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import vuelidate from 'vuelidate'

import router from './router'
import store from './store'

Vue.use(vuelidate);

axios.defaults.baseURL = 'https://vuejs-axios-7fa49.firebaseio.com'
axios.defaults.headers.common['Authorization'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
