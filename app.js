const {
  app,
  shell,
  BrowserWindow,
  dialog,
  ipcMain,
  remote,
} = require("electron");

const path = require("path");
const ioHook = require("iohook");
const fs = require("fs");
require('dotenv').config();
// console.log(process.env)

app.commandLine.appendSwitch("--disable-d3d11");
app.commandLine.appendSwitch("--disable-renderer-backgrounding");
app.commandLine.appendSwitch("--disable-background-timer-throttling");
app.setAppUserModelId("NeoStaff Client");
app.allowRendererProcessReuse = true;

let win;
let child;
//tmpDir path
const dir = path.join(app.getPath("temp"), "./neoStaff_tmp");
const dirScreenshots = path.join(dir, "./ScreenShots");

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    show: false,
    width: 900,
    height: 600,
    minwidth: 900,
    minheight: 600,
    maxWidth: 1280,
    maxHeight: 720,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  win.eventsData = {
    mouse: 0,
    keyboard: 0,
  };

  win.on("close", async (e) => {
    e.preventDefault();
    const res = await dialog.showMessageBox(win, {
      type: "warning",
      title: "Warning",
      defaultId: 0,
      cancelId: 2,
      noLink: true,
      message: "If the app closes it will stop counting time.",
      buttons: ["Minimize", "Direct Exit"],
    });

    if (res.response === 0) {
      win.minimize(); // call the minimize instance method
    } else if (res.response === 1) {
      // get all files from temp folder and do sync with server
      // remove dir once data sync
      win.webContents.send("offline-data-save", "keepIdleDataContinue");

      //app.quit(); //Do not use quit(); try to play twice
      win.destroy(); //exit() directly closes the client and does not execute quit();
    }
  });
  win.removeMenu();
  //win.setMenu(null)
  //and load the index.html of the app.
  //win.removeMenu();
  // win.loadURL(path.join('file://', __dirname, './src/templates/index.html'))
  //win.loadFile("./src/templates/index.html");
  win.loadURL("http://localhost:8080/");

  win.webContents.openDevTools();

  win.once("ready-to-show", () => {
    // setTimeout(() => {
    //     process.crash()
    // }, 3000);
    win.show();

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    if (!fs.existsSync(dirScreenshots)) fs.mkdirSync(dirScreenshots);
  });
  win.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });
}

ipcMain.on("popidle", async (event, arg) => {
  let count = BrowserWindow.getAllWindows().filter((b) => {
    return b.isVisible();
  }).length;

  if (count == 1) {
    child = new BrowserWindow({
      parent: win,
      modal: true,
      width: 480,
      height: 340,
      webPreferences: {
        enableRemoteModule: true,
        nodeIntegration: true,
      },
      focusable: true,
      show: false,
      frame: false,
    });
    //console.log("Child window!");
    child.loadURL(
      path.join("file://", __dirname, "./src/templates/index.html#idle")
    );
    //child.loadURL("http://localhost:8080/#/idle");
    child.once("ready-to-show", () => {
      win.focus();
      child.show();
      child.setAlwaysOnTop(true);
    });
    child.on("close", () => {
      child = null;
    });

    //child.webContents.openDevTools();
  }
});

ipcMain.on("idle-window-send-data", (event, arg) => {
  // Request to update the dashboard details
  if (typeof arg !== "object") {
    if (arg == "keepIdleDataContinue") {
      win.webContents.send("offline-data-save", arg);
    } else if (arg == "continueIntervalWithoutKeepData") {
      win.webContents.send("offline-data-flush", arg);
    } else {
      win.webContents.send("main-window-data-received-fromidlepop", arg);
    }

    win.webContents.send("reset-idlepop-timing", arg);
  } else {
    win.webContents.send("offline-data-save", arg);
    win.webContents.send("reset-idlepop-timing", arg);
  }
});

ipcMain.on("popidleTime", (event, arg) => {
  // Request to update the idle time
  child.webContents.send("popidleTime-update", arg);
});

ipcMain.on("close-main-app", (event, arg) => {
  // Requested from quit button click
  app.quit();
});

ioHook.on("mouseclick", (event) => {
  win.eventsData.mouse++;
  //console.log('Mouse Event Data ::: ', win.eventsData);
  win.webContents.send("mouseevent-data", win.eventsData.mouse);
});

ioHook.on("keypress", (event) => {
  win.eventsData.keyboard++;
  //console.log('Keyboard Event Data ::: ', win.eventsData);
  win.webContents.send("keyevent-data", win.eventsData.keyboard);
});

// Register hook
ipcMain.on("key-mouse-event-hook-register", (event, arg) => {
  if (arg == "start") ioHook.start();
  else if (arg == "stop") {
    ioHook.stop();
    win.eventsData.keyboard = 0;
    win.eventsData.mouse = 0;
  } else if (arg == "reset") {
    ioHook.stop();
    ioHook.start();
    win.eventsData.keyboard = 0;
    win.eventsData.mouse = 0;
  }
});


app.on("browser-window-focus", (event, win) => {
  win.webContents.send("check-update", app.getVersion());
});

app.whenReady().then(() => {
  // disabled capturing crash report
  // app.setPath('crashDumps', path.join(dir, "./crashes"));
  // crashReporter.start({
  //     submitURL:'https://media.neostaff.app/api/v1/',
  //     uploadToServer: false
  // });
 
  createWindow();
});
