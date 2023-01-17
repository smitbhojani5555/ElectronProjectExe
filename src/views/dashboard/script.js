import data from "./data";
import watch from "./watch";
import computed from "./computed";
import methods from "./methods";
import axios from "axios";
import OfflineHandler from "../../handlers/OfflineHandler";
const {
  ipcRenderer,
  remote
} = window.require("electron");
const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");
const app = remote.app;
const path = window.require("path");
const fs = remote.require("fs");
const tmpDir = path.join(app.getPath("temp"), "./neoStaff_tmp");

export default {
  async beforeRouteEnter(to, from, next) {
      if (to.name) {
        // Start the route progress bar.
        NProgress.start()
      }
      let data = {};
      try {
        OfflineHandler.CheckNetworkStatus().then(
          async (success) => {
            let r = await axios.get("user");
            data.user = r.data.data.user;
            data.selectedAccount = r.data.data.accounts[0];
            next((vm) => vm.getUserDetails(data));

            localStorage.setItem("user_Offline", JSON.stringify(data.user));
            localStorage.setItem(
              "account_Offline",
              JSON.stringify(data.selectedAccount)
            );
          },
          (err) => {
            let userOfflineData = localStorage.getItem("user_Offline");

            if (!!userOfflineData) {
              data.user = JSON.parse(userOfflineData);
            }

            let accountOfflineData = localStorage.getItem("account_Offline");
            if (!!accountOfflineData) {
              data.selectedAccount = JSON.parse(accountOfflineData);
            }

            next((vm) => vm.getUserDetails(data));
          }
        );
      } catch (e) {
        logger.error(
          "Erorr while calling User and Account APIs : " + JSON.stringify(e)
        );
        ErrorHandler.render(e);
        localStorage.removeItem("token");
        window.axios.defaults.headers.common["Authorization"] = null;
        next({ name: "login" });
      }
   
  },
  data: data,
  async created() {
    this.neoConfigData = JSON.parse(localStorage.getItem("neo_settings"));
    this.allTaskStates =
      JSON.parse(localStorage.getItem("completedTasks")) || {};
    await this.getTotalWorkedToday();
    await this.getProjectsWorkedToday();
    await this.getTimePassed();
    try {
       OfflineHandler.CheckNetworkStatus().then(
      async (success)  => {
      const res = await axios.get(`accounts/${this.selectedAccount.id}/tasks`);
      if(res.data.data.length > 0){
        res.data.data.forEach((task) => {
          if (!Object.keys(this.allTaskStates).includes(task.id.toString()))
            this.allTaskStates[task.id] = false;
        });
        localStorage.setItem(
          "completedTasks",
          JSON.stringify(this.allTaskStates)
        );

        //TODO: saved data for offline operation
        const fileName = "./projectsTasks_Offline";

        fs.writeFile(
          path.join(tmpDir, fileName + ".txt"),
          JSON.stringify(res.data.data),
          function(err) {
            if (err) {
              console.log(err);
              return;
            }
          }
        );
      }
    },
    (error) => {
      // TODO: get projects from localStorage
      var self = this;
      fs.readdir(tmpDir, (err, files) => {
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }

        let projectList = files.filter(
          (file) => file == "projectsTasks_Offline.txt"
        );

        if (projectList.length > 0) {
          let fileName = path.join(tmpDir, projectList[0]);

          fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
              console.log(data);
              return;
            }

            let _dataObj = JSON.parse(data);

            _dataObj.forEach((task) => {
              if (!Object.keys(self.allTaskStates).includes(task.id.toString()))
              self.allTaskStates[task.id] = false;
            });
            localStorage.setItem(
              "completedTasks",
              JSON.stringify(self.allTaskStates)
            );
          });
        }
      });
    });

    } catch (err) {
      console.log(err);
      ErrorHandler.render(err);
    }
    this.getProjects();
  },
  mounted() {
    // location.reload();
    this.$nextTick(function () {
      var self = this;

      ipcRenderer.on('main-window-data-received-fromidlepop', function (event, store) {
        if(!!store && typeof(store) !== 'object'){
          if(store == 'activated')
          {
            self.idleModeActivated = true;  
            console.log("idle-mode-activated!");
          }
          else if(store == 'de-activated')
          {
            self.idleModeActivated = false;  
            console.log("idle-mode-activated!");
          }
          else if(store == 'stopInterval')
          {
            self.working = false;
            self.stop();
            console.log("Timer stopped!");
          }
          else if(store=='stopIdleReminder'){
            self.idleModeActivated = false;
            self.working = false;
            self.stop();
            console.log("Idle pop reminder stopped!");
          }
        }
      }.bind(self));

      ipcRenderer.on('mouseevent-data', function (event, store) {
        //console.log('ipc::mouse : ', store);
        self.mouse_event = store;
        self.cloneWorkLogs.t_m_event++;
      }.bind(self));

      ipcRenderer.on('keyevent-data', function (event, store1) {
        //console.log('ipc::key : ', store1);
        self.key_event = store1;
        self.cloneWorkLogs.t_k_event++;
      }.bind(self));
    });

    this._data.neoStaffAbout.appVerson = remote.app.getVersion();
    this._data.neoStaffAbout.appName = remote.app.getName();
    this._data.neoStaffAbout.termAndCondition= this.neoConfigData.find(x=> x.ID == 4)["settings_value"]
    this._data.neoStaffAbout.supportURL= this.neoConfigData.find(x=> x.ID == 7)["settings_value"]
    this._data.ScreenshotTime = (this.neoConfigData.find(x => x.ID == 6)["settings_value"] * 60)
    this._data.neoStaffAbout.dashboardURL= this.neoConfigData.find(x=> x.ID == 8)["settings_value"]
    this._data.neoStaffAbout.addEditURL= this.neoConfigData.find(x=> x.ID == 9)["settings_value"]
    this._data.neoStaffAbout.copyrights = this.neoConfigData.find(x => x.ID == 10)["settings_value"]
    this._data.neoStaffAbout.checkForUpdate = navigator.appVersion.indexOf("Mac")!=-1 ? this.neoConfigData.find(x => x.ID == 3)["settings_value"] : this.neoConfigData.find(x => x.ID == 2)["settings_value"]
    var appPreferences =localStorage.getItem("appPreferences");

    var appPreferences =localStorage.getItem("appPreferences");

    if(!!appPreferences){
      this.preference = JSON.parse(appPreferences);
    }
    else
    {
      localStorage.setItem("appPreferences", JSON.stringify(this.preference));
    }
  },

  watch: watch,

  computed: computed,

  methods: methods,
};
