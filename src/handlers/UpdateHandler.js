const { ipcRenderer, remote } = window.require("electron");
const app = remote.app;
const path = window.require("path");
const fs = remote.require("fs");

const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");

