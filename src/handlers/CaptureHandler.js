const { desktopCapturer, ipcRenderer, remote } = window.require("electron");
var ip = require("ip");
const app = remote.app;
const path = window.require("path");
const fs = remote.require("fs");
import OfflineHandler from "../handlers/OfflineHandler";

// temp folder path
const tmpDir = path.join(app.getPath("temp"), "./neoStaff_tmp");
const tmpDirScreenshots = path.join(tmpDir, "./ScreenShots");

var state;
var idle;
var idleInterval;

//default idle time from admin setting, set 10min default
var defaultIdleTime = 600;
var _images = [];
const powerMonitor = remote.powerMonitor;

const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");
var self;

ipcRenderer.on("offline-data-flush", function(event, store) {
  console.log("offline-data-flush");
  console.log("Temp folder: " + tmpDir);

  fs.readdir(tmpDir, (err, files) => {
    if (err) {
      logger.debug("Unable to scan directory: " + JSON.stringify(err));
      return console.log("Unable to scan directory: " + err);
    }
    files.forEach(function(file) {
      let fileName = path.join(tmpDir, file);

      if (
        !file.includes("projectsList_Offline") ||
        !file.includes("offlineData")
      )
        return;

      fs.unlink(fileName, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
});

ipcRenderer.on(
  "offline-data-save",
  function(event, store1) {
    logger.debug("offline-data-saving");
    console.log("offline-data-saving");
    console.log("Temp folder: " + tmpDir);
    if (store1 !== "stopIdleReminder") {
      fs.readdir(tmpDir, (err, files) => {
        if (err) {
          logger.debug("Unable to scan directory: " + JSON.stringify(err));
          return console.log("Unable to scan directory: " + err);
        }

        //listing all files using forEach
        files.forEach(function(file) {
          // scan all dir files and send to server using APIs call
          console.log(file);

          if (typeof store1 === "object") {
            if (!file.includes("idleData_") && !file.includes("offlineData_"))
              return;
          } else {
            if (!file.includes("idleData_") && !file.includes("offlineData_"))
              return;
          }

          let fileName = path.join(tmpDir, file);
          fs.readFile(fileName, "utf8", (err, data) => {
            if (err) {
              console.log(data);
              return;
            }

            let _data = JSON.parse(data);

            // check wather it is keep idle or project assign
            if (typeof store1 === "object") {
              _data["project_id"] = store1.selectedProjectId;
              _data["task_id"] =
                Object.keys(store1.selectedTaskId).length > 0
                  ? store1.selectedTaskId
                  : null;
            }

            console.log("Offline data :" + _data);
            var activitiesApiUrl = `accounts/${_data["selectedAccount"]["id"]}/projects/${_data["project_id"]}/activities`;

            if (!!_data["task_id"] && _data["task_id"] > 0)
              activitiesApiUrl = `accounts/${_data["selectedAccount"]["id"]}/tasks/${_data["task_id"]}/activities`;

            axios
              .post(activitiesApiUrl, _data)
              .then((r) => {
                let msj = r.data.message;
                console.log(msj);
                logger.debug("Offline data save :" + fileName);
                fs.unlink(fileName, (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                });
              })
              .catch((e) => {
                ErrorHandler.render(e);
              });
          });
        });
      });
    }
  }.bind(this)
);

ipcRenderer.on(
  "check-update",
  function(event, version) {
    logger.debug("checking updated version");
    console.log("checking updated version");
    var appLatestVersion;
    axios
      .get("neo_settings")
      .then(async (r) => {
        let neoSettingData = r.data.data;
        let neoSettingJson = JSON.parse(neoSettingData);
        console.log(neoSettingJson);
        appLatestVersion = neoSettingJson.find((x) => x.ID == 1)[
          "settings_value"
        ];
        if (version === appLatestVersion) {
          console.log("Same version");
        } else {
          let msj = "Please Update App Version !";
          let d = await NotificationHandler.updatePopup(msj);
          if (d) {
            var updateUrl =
              navigator.appVersion.indexOf("Mac") != -1
                ? neoSettingJson.find((x) => x.ID == 3)["settings_value"]
                : neoSettingJson.find((x) => x.ID == 2)["settings_value"];
            window.open(updateUrl, "_blank");
          }
        }
      })
      .catch((e) => {
        ErrorHandler.render(e);
      });
  }.bind(this)
);

ipcRenderer.on(
  "reset-idlepop-timing",
  function(event, store1) {
    logger.debug("reset-idlepop-timing");
    console.log("reset-idlepop-timing");
    defaultIdleTime = 600;
  }.bind(this)
);

class CaptureHandler {
  startIdlepopInterval() {
    let activatedIdle = false;
    idleInterval = setInterval(() => {
      state = powerMonitor.getSystemIdleState(180);
      //console.log('Current System State - ', state);

      idle = powerMonitor.getSystemIdleTime();
      //console.log('Current System Idle Time - ', idle);
      if (state == "idle") {
        if (idle >= defaultIdleTime) {
          let _displaytime = defaultIdleTime;
          ipcRenderer.send("popidle", "true");
          setTimeout(() => {
            ipcRenderer.send("popidleTime", _displaytime / 60);
            activatedIdle = true;
          }, 1000);

          //resetting default idle time to 10min
          defaultIdleTime = defaultIdleTime + 600;
        }
      } else if (state == "resume" || state == "active") {
        if (activatedIdle) {
          defaultIdleTime = 600;
        }
      }
    }, 60000);
  }

  stopIdlepopInterval() {
    defaultIdleTime = 600;

    ipcRenderer.send("idle-window-send-data", "keepIdleDataContinue");
    clearInterval(idleInterval);
  }

  async render(data) {
    try {
      let _this = this;
      const promises = [];
      _images = [];
      desktopCapturer
        .getSources({
          types: ["window", "screen"],
        })
        .then(async (sources) => {
          for (let source of sources) {
            // Filter: main screen
            if (
              source.name === "Entire Screen" ||
              source.name === "Screen 1" ||
              source.name === "Screen 2"
            ) {
              // if (source.name.toLowerCase().indexOf("screen") > -1) {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  audio: false,
                  video: {
                    mandatory: {
                      chromeMediaSource: "desktop",
                      chromeMediaSourceId: source.id,
                      minWidth: 1280,
                      maxWidth: 4000,
                      minHeight: 720,
                      maxHeight: 4000,
                    },
                  },
                });
                promises.push(_this.createImage(stream));
                //_this.handleStream(stream, data);
              } catch (e) {
                console.log(e);
              }
            }
          }

          Promise.all(promises).then(() => {
            //_this.handleStream(data);

            // TODO: Screenshot will be taken random within 10min period, saved into temp
            let _data = {
              from: this.fromTime(data.from),
              to: this.toTime(data.to),
              screenshots: _images,
            };
            let fileName = "./" + _data.from + "_" + _data.to;

            fs.writeFile(
              path.join(tmpDirScreenshots, fileName + ".txt"),
              JSON.stringify(_data),
              function(err) {
                if (err) {
                  console.log(err);
                  return;
                }

                logger.info(
                  "The screenshots file has been stored in temp folder!!!"
                );
              }
            );
          });
        });
    } catch (e) {
      logger.error("Unable to take screenshots data: " + JSON.stringify(e));
    }
  }

  handleStream(data) {
    this.from = data.from;
    this.to = data.to;
    this.task_id = data.task_id;
    this.project_id = data.project_id;
    this.total_key_event = data.total_key_event;
    this.total_mouse_event = data.total_mouse_event;
    this.total_active_time = data.total_active_time;
    this.date = new Date().toISOString().substr(0, 10);
    this.idleModeActivated = data.idleModeActivated;
    this.selectedAccount = data.selectedAccount;
    this.total_activity_percentage = data.total_activity_percentage.toFixed(2);
    // this.createImage(stream);
    this.send();
  }

  createImage(stream) {
    return new Promise((resolve, reject) => {
      let format = "image/png";

      // Create Vide element
      var video = document.createElement("video");
      video.style.cssText = "position:absolute;top:-10000px;left:-10000px;";

      // Event connected to stream

      video.onloadedmetadata = function() {
        // Set video ORIGINAL height (screenshot)
        video.style.height = this.videoHeight + "px"; // videoHeight
        video.style.width = this.videoWidth + "px"; // videoWidth

        video.play();

        // Create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.videoWidth;
        canvas.height = this.videoHeight;
        var ctx = canvas.getContext("2d");
        // Draw video on canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let image = canvas.toDataURL(format);

        // create File object
        // fetch(image)
        // .then(res => res.blob())
        // .then(blob => {
        //     _images.push(new File([blob], "Screenshot_" + Date.now() +".png", { type: "image/png" }));
        //     resolve(`Completed`);
        // })
        // _this.send(image);

        _images.push(image);
        video.remove();
        try {
          // Destroy connect to stream
          stream.getTracks()[0].stop();
          console.log(stream.getTracks());
        } catch (e) {}
        resolve(`Completed`);
      };

      video.srcObject = stream;
      document.body.appendChild(video);
    });
  }
  send() {
    try {
      fs.readdir(tmpDirScreenshots, (err, files) => {
        if (err) {
          logger.debug("Unable to scan directory: " + JSON.stringify(err));
          return console.log("Unable to scan directory: " + err);
        }

        let fromTime = this.fromTime(this.from);
        let toTime = this.toTime(this.to);

        let screenShotFileName = "" + fromTime + "_" + toTime;
        logger.debug(
          "Activities APIs calling, get screenshot file from temp :" +
            screenShotFileName
        );

        var self = this;

        files.forEach(function(file) {
          if (!file.includes(screenShotFileName)) return;

          var screenshotfile = path.join(tmpDirScreenshots, file);
          fs.readFile(screenshotfile, "utf8", (err, streamdata) => {
            if (err) {
              logger.error(err);
              return;
            }

            fs.unlink(screenshotfile, (err) => {
              if (err) {
                logger.error(err);
                return;
              }
            });

            let screenshotData = JSON.parse(streamdata);

            let data = {
              from: fromTime,
              to: toTime,
              second: 0,
              date: self.date,
              keyboard_count: self.total_key_event,
              mouse_count: self.total_mouse_event,
              total_activity: self.total_active_time,
              total_activity_percentage: self.total_activity_percentage,
              screenshots: screenshotData["screenshots"],
            };

            //TODO:
            /**
             * if idlemode activated or system mode get idle > 5min
             * if no internet connection
             * saved offline data
             */
            let fileName = "./idleData_" + Date.now();

            OfflineHandler.CheckNetworkStatus().then(
              (success) => {
                if (
                  (!!self.idleModeActivated && self.idleModeActivated) ||
                  (state == "idle" && idle >= 180)
                ) {
                  data["task_id"] = self.task_id;
                  data["project_id"] = self.project_id;
                  data["selectedAccount"] = self.selectedAccount;

                  fs.writeFile(
                    path.join(tmpDir, fileName + ".txt"),
                    JSON.stringify(data),
                    function(err) {
                      if (err) {
                        console.log(err);
                        return;
                      }

                      self.saveActivityNotify();
                      console.log("The file has been stored in temp folder!!!");
                      logger.info("The file has been stored in temp folder!!!");
                      return false;
                    }
                  );
                } else {
                  var activitiesApiUrl = `accounts/${self.selectedAccount.id}/projects/${self.project_id}/activities`;

                  if (self.task_id)
                    activitiesApiUrl = `accounts/${self.selectedAccount.id}/tasks/${self.task_id}/activities`;

                  axios
                    .post(activitiesApiUrl, data)
                    .then((r) => {
                      let msj = r.data.message;
                      console.log(msj);
                      self.saveActivityNotify();
                      return false;
                    })
                    .catch((e) => {
                      ErrorHandler.render(e);
                    });
                }
              },
              (err) => {
                fileName = "./offlineData_" + Date.now();

                data["task_id"] = self.task_id;
                data["project_id"] = self.project_id;
                data["selectedAccount"] = self.selectedAccount;

                fs.writeFile(
                  path.join(tmpDir, fileName + ".txt"),
                  JSON.stringify(data),
                  function(err) {
                    if (err) {
                      console.log(err);
                      return;
                    }

                    self.saveActivityNotify();
                    console.log("The file has been stored in temp folder!!!");
                    return false;
                  }
                );
              }
            );
          });
        });
      });
    } catch (e) {
      logger.error("Unable to send data activities api: " + JSON.stringify(e));
    }
  }

  fromTime(d) {
    var h = d.getHours();
    var m = d.getMinutes();

    let second = h * 3600;
    var _m = Number.isInteger(m / 10);

    if (!_m) {
      while (!Number.isInteger(m / 10)) {
        m = m - 1;
      }
    }

    second = second + m * 60;

    return second;
  }

  toTime(d) {
    var h = d.getHours();
    var m = d.getMinutes();

    let second = h * 3600;
    var _m = Number.isInteger(m / 10);

    if (!_m) {
      while (!Number.isInteger(m / 10)) {
        m = m + 1;
      }
    } else {
      m = m + 10;
    }

    second = second + m * 60;

    return second;
  }

  saveActivityNotify() {
    logger.info("Activity saved successfully");
    var appPreferences = localStorage.getItem("appPreferences");

    if (!!appPreferences) {
      let preference = JSON.parse(appPreferences);

      if (preference.startOrStopTimerNotification) {
        if (Notification.permission === "granted") {
          const notification = new Notification("NeoStaff", {
            body: "Screenshot captured!",
            icon: "http://timetracker.vnddev.com/app/public/favicon.ico",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {});
        }
      }
    }
  }
}

export default new CaptureHandler();
