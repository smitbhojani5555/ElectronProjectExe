// window._ = require('lodash')

import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";

// Vue.use(window.require("vue-electron"));
const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");

const baseURL =
  process.env.NODE_ENV === "production"
    ? // "http://timetracker.vnddev.com/api/desktop/" :
      // "http://timetracker.vnddev.com/api/desktop/";
      "https://media.neostaff.app/api/v1/"
    : "https://media.neostaff.app/api/v1/";
// : "http://localhost:8000/api/desktop/";

window.$ = window.jQuery = require("jquery");

window.axios = require("axios");
window.axios.defaults.baseURL = baseURL;
window.axios.defaults.headers.common["Authorization"] =
  "Bearer " + localStorage.getItem("token");

// Add a 401 response interceptor
window.axios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    logger.debug("Unauthorized : " + error.response.status);
    if (401 === error.response.status) {
      localStorage.removeItem("token");
      window.axios.defaults.headers.common["Authorization"] = null;
      router.push({
        name: "login",
      });
    } else {
      return Promise.reject(error);
    }
  }
);

Vue.config.productionTip = false;

// Handlers
window.NotificationHandler = require("./handlers/NotificationHandler").default;
window.ErrorHandler = require("./handlers/ErrorHandler").default;
window.CaptureHandler = require("./handlers/CaptureHandler").default;
window.OffileHandler = require("./handlers/OfflineHandler").default;
window.LoggerHandler = require("./handlers/LoggerHandler").default;

new Vue({
  router,
  store,
  vuetify,
  render: function(h) {
    return h(App);
  }
}).$mount("#app");

logger.info("App started");