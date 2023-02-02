import CaptureHandler from "../../handlers/CaptureHandler";
import LoginRequest from "../../requests/LoginRequest";
import ProjectRequest from "../../requests/ProjectRequest";
import CommonRequest from "../../requests/CommonRequest";
const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");
// import { mapState, mapActions } from "vuex";

const {
    ipcRenderer
} = window.require("electron");
var ip = require('ip');
var keycountTimer = null;
let timerStartedDate = new Date();

export default {
  // ...mapActions(["setTaskStates"]),
  getUserDetails(data) {
    this.user = data.user;
    //this.company = data.company;
    this.selectedAccount = data.selectedAccount;
    CommonRequest.getUserConfig();
  },
  getProjects() {
    this.busyProject = true;
    this.tasksList = [];
    this.totalTasks = [];
    this.project = null;
    this.projectSelected = null;
    this.projectsList = [];
    ProjectRequest.index(this);
  },

  selectProject(project, start) {
    logger.info("selectProject clicked");
    let projectSelected = this.projectSelected;
    this.selectedProject = project;
    this.project = project;
    if (projectSelected !== "project-sel-" + project.id) {
      this.projectSelected = "project-sel-" + project.id;
      let id = project.id;
      this.getTasks(id);

      // if (start) {
      //   this.working = true;
      //   this.stoping = false;
      // }
      //else {
      //   this.stoping = true;
      // }
    } else {
      if (start && !this.busyTask) {
        // if (!this.taskSelected) {
        //   let title = 'No Task';
        //   let msj = 'Please select task.'
        //   NotificationHandler.errorAlert(title, msj)
        // } else {
        this.task = null;
        this.playingTask = null;
        this.projectPlayed = "project-sel-" + project.id;
        this.project = project;
        this.taskPlayed = null;
        this.working = true;
        this.stoping = false;
        // }
      }
    }

    // this data will used in idlepop
    localStorage.setItem(
      "runningPojects",
      JSON.stringify({
        tasksList: this.tasksList,
        projectsList: this.projectsList,
        selectedProject: this.selectedProject,
        selectedAccount: this.selectedAccount,
      })
    );
  },
  selectTask(task, start) {
    logger.info("selectTask clicked");
    let taskSelected = this.taskSelected;
    if (taskSelected !== "task-sel-" + task.id) {
      this.taskSelected = "task-sel-" + task.id;
      this.task = task;
    }

    if (start) {
      this.playingTask = this.task;
      this.project = this.selectedProject;
      this.projectPlayed = this.projectSelected;
      this.taskPlayed = "task-sel-" + task.id;
      this.working = true;
      this.stoping = false;
    } else {
      // this.stoping = true;
    }
  },
  async completeTask(task) {
    let cm = "Are you sure the task is complete?";
    let id = task.id;
    // let completedTasks =
    //   JSON.parse(localStorage.getItem("completedTasks")) || {};
    let c = await NotificationHandler.confirm(cm);
    if (c) {
      // completedTasks[id] = true;
      this.allTaskStates[id] = true;

      // let r = await ProjectRequest.completeTask(this,id);
      // if (r) {
      //   let msj = r.data.message;
      //   this.taskSelected = null;
      //   this.task = null;
      //   NotificationHandler.simpleSuccess(msj);
      //   let completedTasks = this.taskStates;
      //   completedTasks[id] = true;
      //   this.setTaskStates({
      //     data: completedTasks,
      //   });
      //   localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

      // $.each(this.totalTasks, (i, t) => {
      //   if (t.id == id) {
      //     t.completed = true;
      //   }
      // });
      // this.$nextTick(() => {
      //   this.tasksList = [];
      //   let totalTasks = this.totalTasks;
      //   if (this.tasksCompleted) {
      //     this.tasksList = totalTasks;
      //   } else {
      //     let tasks = [];
      //     $.each(totalTasks, (i, t) => {
      //       if (!t.completed) tasks.push(t);
      //     });
      //     this.tasksList = tasks;
      //   }
      // });
      // }
    } else {
      // completedTasks[id] = false;
      this.allTaskStates[id] = false;
    }
    // this.setTaskStates({
    //   data: completedTasks,
    // });
    console.log(this.allTaskStates);
    localStorage.setItem("completedTasks", JSON.stringify(this.allTaskStates));
  },
  getTasks(id) {
    this.busyTask = true;
    ProjectRequest.tasks(this, id);
  },
  start() {
    logger.debug("Started timer");
    this.working = true;
    this.stoping = false;
    console.log("start");
    console.log(this.working);
    console.log(this.stopping);

    CaptureHandler.startIdlepopInterval();
    ipcRenderer.send("key-mouse-event-hook-register", "start");
    logger.debug("key-mouse-event-hook-register is started");
    timerStartedDate = new Date();
    this.total_active_time = this.getSystemTimeWithin10min();
    
    this.screenshotCapturedTime = this.getRandomScreenshotTime(1,this.total_active_time);
    logger.debug("total_active_time :" +this.total_active_time);
    this.runing();
    //this.getcountkey();
  },
  getcountkeyNew() {
    this.total_mouse_event = this.mouse_event;
    this.total_key_event = this.key_event;
    let total_activity = this.total_key_event + this.total_mouse_event;
    this.total_activity_percentage =
      (total_activity / this.total_active_time) * 100;

    console.log("M-A", this.total_mouse_event);
    console.log("K-A", this.total_key_event);
    ipcRenderer.send("key-mouse-event-hook-register", "reset");
  },
  getcountkey() {
    this.mouse_event = 0;
    this.key_event = 0;
    let start_key_time = 0;

    this.total_active_time = 0;
    this.total_mouse_event = 0;
    this.total_key_event = 0;

    if (keycountTimer != null) {
      clearInterval(keycountTimer);
    }

    keycountTimer = setInterval(() => {
      window.addEventListener(
        "keypress",
        function() {
          key_event += 1;
        },
        true
      );

      window.addEventListener(
        "mousedown",
        function() {
          mouse_event += 1;
        },
        true
      );

      // window.addEventListener('mousemove', function() {
      //     this.mouse_event += 1;// }, true);

      window.addEventListener(
        "scroll",
        function() {
          mouse_event += 1;
        },
        true
      );

      if (start_key_time % 60000 == 0) {
        this.total_active_time = this.key_event + this.mouse_event;
        this.total_mouse_event = this.mouse_event;
        this.total_key_event = this.key_event;
        console.log("M-A", this.total_mouse_event);
        console.log("K-A", this.total_key_event);
        ipcRenderer.send("key-mouse-event-hook-register", "reset");
      }

      start_key_time += 1;
      //console.log(start_key_time);
    }, 1000);
  },
  stop() {
    this.stoping = false;
    this.timer.h = 0;
    this.timer.m = 0;
    this.timer.s = 0;
    this.timer.passed = 0;
    this.screenshotCaptured = false;
    this.screenshotCapturedTime = 0;

    console.log("stop");
    console.log(this.working);
    console.log(this.stopping);

    // check wih app preference data
    if (!!this.preference) {
      if (this.preference.startOrStopTimerNotification) {
        if (Notification.permission === "granted") {
          const notification = new Notification("NeoStaff", {
            body:
              "Stopped timer for project " +
              (this.project ? this.project.title : ""),
            icon: "http://timetracker.vnddev.com/app/public/favicon.ico",
          });
        }
      }
    }

    CaptureHandler.stopIdlepopInterval();
    ipcRenderer.send("key-mouse-event-hook-register", "stop");
    this.regiserPostTimer();
    logger.debug("Stopped timer");
    logger.debug("key-mouse-event-hook-register stopped");
  },
  getSystemTimeWithin10min() {
    let d = timerStartedDate;
    let m = d.getMinutes();
    let _m = Number.isInteger(m / 10);
    let _r = 0;

    if (_m) {
      var neoConfigData = JSON.parse(localStorage.getItem("neo_settings"));
      var ScreenshotTime = (neoConfigData.find(x => x.ID == 6)["settings_value"] * 60);
      return ScreenshotTime;
    } else {
      while (!Number.isInteger(m / 10)) {
        m++;
        _r++;
      }
    }

    return _r * 60;
  },
  runing() {
    if (this.working) {
      if (!this.stoping) {
        // as per jose request we dont need this feature
        // if (!this.firstCaptured) {
        //     // NotificationHandler.simpleSuccess("Captured");

        //     // check wih app preference data
        //     if(!!this.preference){
        //         if(this.preference.startOrStopTimerNotification){
        //             if (Notification.permission === "granted") {
        //                 const notification = new Notification("NeoStaff", {
        //                     body: "Started timer for project " + (this.project ? this.project.title : ''),
        //                     icon: "http://timetracker.vnddev.com/app/public/favicon.ico"
        //                 })
        //             } else if (Notification.permission !== "denied") {
        //                 Notification.requestPermission().then(permission => {
        //                     // const notification = new Notification("NeoStaff", {
        //                     //     body: "Captured",
        //                     //     icon: "http://timetracker.vnddev.com/app/public/favicon.ico"
        //                     // })
        //                 });
        //             }
        //         }
        //     }

        //     this.timer.passed = 0;
        //     let task_id;
        //     if (this.task) {
        //         task_id = this.task.id;
        //     } else {
        //         task_id = null;
        //     }
        //     this.getcountkeyNew();
        //     let data = {
        //         from: this.lastScreenshot,
        //         to: this.timePassed.time,
        //         task_id: task_id,
        //         project_id: this.project.id,
        //         total_active_time: this.total_active_time,
        //         total_key_event: this.total_key_event,
        //         total_mouse_event: this.total_mouse_event,
        //         idleMode: this.idleModeActivated,
        //         selectedAccount : this.selectedAccount,
        //         total_activity_percentage: ((systemActiveTime / 600) * 100)
        //     };
        //     console.log('running:',data);
        //     CaptureHandler.render(data);
        //     this.lastScreenshot = this.timePassed.time;
        //     this.firstCaptured = true;
        //     //this.getcountkey();
        // }

        this.changeTimer();
        this.saveOfflineData();

        this.$nextTick(() => {
          let passed = this.timer.passed;
          //let timeScreen = this.company.time;
          //let timeScreen = 600;
          if(passed === this.screenshotCapturedTime)
          {
            if(!this.screenshotCaptured)
            {
              this.screenshotCaptured = true;
              this.takeScreenshot();
            }
          }
          
          if (passed === this.total_active_time) {
            this.activitiesDataPost();
          }
        });
      }
      setTimeout(() => {
        this.runing();
      }, 1000);
    }
  },
  regiserPostTimer() {
    if (!this.working) {
      if (!this.stoping) {
        // save worked data duing timer stopped
        let passed = this.t_t_passed;
        if (passed === this.total_active_time) {
          this.takeScreenshot();
        } else {
          setTimeout(() => {
            this.regiserPostTimer();
          }, 1000);
        }
        this.t_t_passed++;
      }
    }
  },
  takeScreenshot() {
    let data = {
      from: timerStartedDate,
      to: timerStartedDate
    }
    CaptureHandler.render(data);
  },
  getRandomScreenshotTime(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  activitiesDataPost(){
    console.log("running");
    console.log(this.working);
    console.log(this.stopping);

    this.getcountkeyNew();
    this.timer.passed = 0;
    let task_id = null;
    if (this.task) {
      task_id = this.task.id;
    }

    let total_a_percentage =
      this.total_activity_percentage <= 100
        ? this.total_activity_percentage
        : 100;

    let data = {
      from: timerStartedDate,
      to: timerStartedDate,
      task_id: task_id,
      project_id: this.project.id,
      total_active_time:
        this.cloneWorkLogs.t_a_time > 0
          ? this.cloneWorkLogs.t_a_time
          : this.total_active_time,
      total_key_event:
        this.cloneWorkLogs.t_k_event > 0
          ? this.cloneWorkLogs.t_k_event
          : this.total_key_event,
      total_mouse_event:
        this.cloneWorkLogs.t_m_event > 0
          ? this.cloneWorkLogs.t_m_event
          : this.total_mouse_event,
      total_activity_percentage:
        this.cloneWorkLogs.t_a_percentage > 0
          ? this.cloneWorkLogs.t_a_percentage
          : total_a_percentage,
      idleMode: this.idleModeActivated,
      selectedAccount: this.selectedAccount,
      idleModeActivated: this.idleModeActivated,
    };
    logger.debug("takeScreenshot method called : " + JSON.stringify(data));
    console.log("nextTick:", data);
    CaptureHandler.handleStream(data);
    this.lastScreenshot = this.timePassed.time;
    this.resetTimer();
    //this.getcountkey();
  },
  resetTimer() {
    timerStartedDate = new Date();
    var neoConfigData = JSON.parse(localStorage.getItem("neo_settings"));
    var ScreenshotTime = (neoConfigData.find(x => x.ID == 6)["settings_value"] * 60);
    this.total_active_time = ScreenshotTime;
    this.mouse_event = 0;
    this.key_event = 0;

    this.cloneWorkLogs.t_a_time = 0;
    this.cloneWorkLogs.t_m_event = 0;
    this.cloneWorkLogs.t_k_event = 0;
    this.cloneWorkLogs.t_a_percentage = 0;
    this.cloneWorkLogs.t_t_passed = 0;

    this.screenshotCaptured = false;
    this.screenshotCapturedTime = this.getRandomScreenshotTime(1,this.total_active_time);
    console.log("cloneWorkLogs :", this.cloneWorkLogs);
  },
  changeTimeToProject() {
    let project = this.project;
    let todayProjects = JSON.parse(localStorage.getItem("projectsWorkedToday"));
    let todayItems = todayProjects.items ? todayProjects.items : [];
    const storageProject = todayItems.filter((elem) => {
      return elem.id === project.id;
    })[0];

    let newItems = [];
    if (storageProject) {
      let h = parseInt(storageProject.time.split(":")[0]);
      let tMins = parseInt(storageProject.time.split(":")[1]);

      tMins++;

      let time;
      if (tMins > 59) {
        time = `${h + 1}:00`;
      } else {
        time = tMins > 9 ? `${h}:${tMins}` : `${h}:0${tMins}`;
      }

      project.time = time;

      newItems = todayItems.map((elem) => {
        if (elem.id === project.id) {
          return { id: elem.id, time: time };
        } else {
          return elem;
        }
      });
    } else {
      project.time = "0:01";
      newItems = todayItems.map((elem) => {
        return elem;
      });
      newItems.push({ id: project.id, time: "0:01" });
    }

    this.projectsWorkedToday.items = newItems.map((elem) => {
      return elem;
    });

    localStorage.setItem(
      "projectsWorkedToday",
      JSON.stringify({
        date: new Date().toLocaleDateString(),
        items: newItems,
      })
    );
  },
  getProjectsTimeToday() {
    if (!!this.projectsList) {
      for (let aProject of this.projectsList) {
        let wProjects = this.projectsWorkedToday.items;
        if (wProjects) {
          let time;
          if (wProjects.length > 0) {
            for (let j of wProjects) {
              if (j.id == aProject.id) {
                time = j.time;
                aProject.time = time;
                break;
              } else {
                time = 0 + ":00";
                aProject.time = time;
              }
            }
          } else {
            time = 0 + ":00";
            aProject.time = time;
          }
        }
      }
    }
  },
  changeTimer() {
    this.timer.s += 1;

    let th = this.timer.h;
    let tm = this.timer.m;
    let ts = this.timer.s;

    if (ts > 59) {
      this.timer.s = 0;
      this.timer.m += 1;

      this.changeTimeToProject();
      let twm = (this.totalWorkedToday.mins += 1);
      if (twm > 59) {
        this.totalWorkedToday.mins = 0;
        this.totalWorkedToday.hours += 1;
      }
      localStorage.setItem(
        "totalWorkedToday",
        JSON.stringify(this.totalWorkedToday)
      );
    }

    if (tm > 59) {
      this.timer.s = 0;
      this.timer.m = 0;
      this.timer.h += 1;
    }

    this.timer.passed += 1;
    this.timePassed.time += 1;
  },
  async logout() {
    this.stop();
    let msj = "Do you want sign out?";
    let r = await NotificationHandler.confirm(msj);
    if (r) {
      this.closing = true;
      let c = await LoginRequest.logout(this);
      localStorage.removeItem("token");
      window.axios.defaults.headers.common["Authorization"] = null;
      this.$router.push({
        name: "login",
      });
    }
  },

  // Methods for default properties

  getTotalWorkedToday() {
    let item = JSON.parse(localStorage.getItem("totalWorkedToday"));
    let today = new Date().toLocaleDateString();
    let total;
    if (!item || item.date != today) {
      total = {
        date: today,
        hours: 0,
        mins: 0,
      };
      localStorage.setItem("totalWorkedToday", JSON.stringify(total));
      this.totalWorkedToday = total;
    } else {
      this.totalWorkedToday = item;
    }
    return true;
  },

  getProjectsWorkedToday() {
    let projects = JSON.parse(localStorage.getItem("projectsWorkedToday"));
    let today = new Date().toLocaleDateString();
    if (!projects || today != projects.date) {
      projects = {
        date: today,
        items: [],
      };
      localStorage.setItem("projectsWorkedToday", JSON.stringify(projects));
    }
    this.projectsWorkedToday = projects;
    return true;
  },

  getTimePassed() {
    let timePassed = JSON.parse(localStorage.getItem("timePassed"));
    let today = new Date().toLocaleDateString();
    if (!timePassed || today != timePassed.date) {
      timePassed = {
        date: today,
        time: 0,
      };
      localStorage.setItem("projectsWorkedToday", JSON.stringify(timePassed));
    }
    this.timePassed = timePassed;
    return true;
  },

  openLinkInBrowser(url) {
    window.open(url, "_blank");
  },

  quitApp() {
    ipcRenderer.send("close-main-app");
  },

  sendReportAnError(data) {
    let userId = localStorage.getItem("userID");
    var self = this;
    $.getJSON('http://www.geoplugin.net/json.gp', function(res) {
      let returndata = {
        UserID: !!userId ? userId : 0,
        Description: data["error"],
        Ip: res.geoplugin_request,
        Datetime: new Date().getTime(),
      };
      CommonRequest.reportAnError(self, returndata);  
  }).catch((e) => {
    let record = {
      UserID: 1,
      Description: data["error"],
      Ip: "127.0.0.1",
      Datetime: new Date().getTime(),
    };
    CommonRequest.reportAnError(self, record);  
  })
  },

  applyPreference(data) {
    console.log(data);

    localStorage.setItem("appPreferences", JSON.stringify(data));
  },

  saveOfflineData() {
    if (this.cloneWorkLogs.t_a_time <= 600)
      this.cloneWorkLogs.t_a_time += 1;

    this.t_t_passed = this.timer.passed;

    let t_activity =
      this.cloneWorkLogs.t_m_event + this.cloneWorkLogs.t_k_event;
    let t_a_percentage = (t_activity / this.cloneWorkLogs.t_a_time) * 100;
    this.cloneWorkLogs.t_a_percentage =
      t_a_percentage <= 100 ? t_a_percentage : 100;
  }
};