const { remote } = window.require("electron");
const app = remote.app;
const path = window.require("path");
var log4js = window.require("log4js");
const dir = path.join(app.getPath("temp"), "./neoStaff_tmp/Logs");

//disable logs
console.log = function() {}

log4js.configure({
  appenders: {
    neostaff: {
      type: "dateFile",
      filename: path.join(dir, "all-the-logs.log"),
    }
  },
  categories: {
    default: { appenders: ["neostaff"], level: "debug" }
  },
});

class LoggerHandler {}
export default new LoggerHandler();
