import data from "./data";
import watch from "./watch";
import computed from "./computed";
import methods from "./methods";

import axios from "axios";
const {
  ipcRenderer
} = window.require("electron");

export default {
  data: data,
  mounted() {
    // location.reload();
    ipcRenderer.send('idle-window-send-data',"activated");
    
    this.$nextTick(function () {
      var self = this;

      ipcRenderer.on('popidleTime-update',function (event, store) {
        console.log('popideltime : ', store);
        self.idleTimeCount = store;
      }.bind(self));
    });
  },

  watch: watch,

  computed: computed,

  methods: methods,
};