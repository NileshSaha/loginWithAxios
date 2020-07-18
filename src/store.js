import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import {key} from './config' 
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken : null,
    userId: null,
    user: null
  },
  mutations: {
    authUser (state, userData) {
      state.idToken = userData.token;
      state.userId = userData.userId;
    },
    storeUser (state, user) {
      state.user = user;
    },
    clearAuth (state) {
      state.idToken = null;
      state.userId = null;
    }
  },
  actions: {
    setLogoutTimer ({dispatch}, expirationTime) {
      setTimeout(() => {
        dispatch('logout');
      }, expirationTime * 1000);
    },
    localStore ({commit}, localData) {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + localData.expiresIn * 1000);
      localStorage.setItem('token', localData.idToken);
      localStorage.setItem('userId', localData.userId);
      localStorage.setItem('expirationDate', expirationDate);
    },
    signup ({commit, dispatch}, authData) {
      axios
      .post('accounts:signUp', null, {
        params : {
          key
        },
        data: {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true,
        }
      })
      .then(res => {
        console.log(res);
        commit('authUser', {
          token : res.data.idToken,
          userId: res.data.localId
        });
        dispatch('localStore', {
          idToken :res.data.idToken,
          expiresIn: res.data.expiresIn,
          userId: res.data.localId,
        });
        dispatch('storeUser', authData);
        dispatch('setLogoutTimer', res.data.expiresIn);
        router.replace('/dashboard');
      })
      .catch(err => console.log(err));
    },
    login ({commit, dispatch}, authData) {
      axios
        .post('accounts:signInWithPassword', null, {
          params : {
            key
          },
          data: {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true,
          }
        })
        .then(res => {
          console.log(res);
          commit('authUser', {
            token : res.data.idToken,
            userId: res.data.localId
          });
          dispatch('localStore', {
            idToken :res.data.idToken,
            expiresIn: res.data.expiresIn,
            userId: res.data.localId,
          });
          dispatch('setLogoutTimer', res.data.expiresIn);
          router.replace('/dashboard');
        })
        .catch(err => console.log(err));
    },
    tryAutoLogin ({commit}) {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      } 
      const expirationDate = localStorage.getItem('expirationDate');
      const now = new Date();
      if (now >= expirationDate) {
        return;
      }
      const userId = localStorage.getItem('userId');
      commit('authUser',{
        token,
        userId
      });
      router.replace('/dashboard');
      
    },
    storeUser ({commit, state}, userData) {
      if (!state.idToken) {
        return;
      }
      globalAxios
        .post('/users.json?auth=' + state.idToken, userData)
        .then(res => {
          console.log(res);
        })
        .catch(err => console.log(err));
    },
    fetchUser ({commit, state}) {
      if (!state.idToken) {
        return;
      }
      globalAxios
        .get('/users.json?auth='+ state.idToken)
        .then(res => {
          console.log(res);
          const data = res.data;
          const users = [];
          for (let key in data) {
            const user = data[key];
            user.id = key;
            users.push(user);
          }
          console.log(users);
          commit('storeUser', users[0]);
        })
        .catch(err => console.log(err));
    },
    logout({commit}) {
      commit('clearAuth');
      localStorage.removeItem('expirationDate');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      router.replace('/signin');
    }
  },
  getters: {
    user (state) {
      return state.user;
    },
    isAuthenticated (state) {
      return state.idToken !== null;
    }
  }
})