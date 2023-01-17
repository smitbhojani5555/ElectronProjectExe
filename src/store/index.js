import Vue from "vue";
import Vuex from "vuex";

// import { createPersistedState, createSharedMutations } from "vuex-electron";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    taskStates: JSON.parse(localStorage.getItem("completedTasks")) || {},
  },
  mutations: {
    setTaskStates: (state, { data }) => {
      state.taskStates = data;
    },
  },
  actions: {
    setTaskStates: ({ commit }, payload) => {
      commit("setTaskStates", payload);
    },
  },
  modules: {},

  // plugins: [createPersistedState(), createSharedMutations()],
  // strict: process.env.NODE_ENV !== "production",
});
