import ProjectRequest from "../../requests/ProjectRequest";
const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");

const {
    remote,
    ipcRenderer
} = window.require("electron");

export default {
    stopInterval() {
        this.stopConfirmDialog = true;
        logger.info("Stop button called without keepdata");
    },
    continueInterval(){
        if(this.keepIdleFlag){
            logger.info("Continue button called with keepdata");
            ipcRenderer.send('idle-window-send-data',"keepIdleDataContinue");
            this.common();
        }
        else if(this.assignProjectData != null){
            logger.info("Continue button called with project assigned");
            ipcRenderer.send('idle-window-send-data',data);
            this.common();
        }
        else{
            logger.info("Are you sure you want to cotinue without keepIdle data?");
            this.confirmDialog = true;
        }
    },
    selectProject(id) {
        this.busyTask = true;
        this.getTasks(id);
    },
    getTasks(id) {
        ProjectRequest.tasks(this, id);
    },
    assignProject(){
        this.assignProjectData={
            selectedProjectId:this.assinedProject,
            selectedTaskId:this.assinedTask
        };
        this.dialog = false;
    },
    common(){
        ipcRenderer.send('idle-window-send-data',"de-activated");
        remote.getCurrentWindow().close();
    },
    cancelConfim() {
        this.confirmDialog = false;
    },
    agreeWithoutKeepIdle() {
        this.confirmDialog = false;
        ipcRenderer.send('idle-window-send-data',"continueIntervalWithoutKeepData");
        logger.info("use agreed without KeepIdle data");
        this.common();
    },

    neverReminderForIdle(){
        logger.info("User has stopped idle reminder");
        ipcRenderer.send('idle-window-send-data',"stopIdleReminder");
        this.common();
    },
    stop(){
        logger.info("User has stopped idle interval");
        ipcRenderer.send('idle-window-send-data',"stopInterval");
        this.common();
    }
};