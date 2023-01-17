// import { mapState, mapActions } from "vuex";
export default {
    // ...mapState(["taskStates"]),
    getProjectTitle() {
        if (this.project) {
            return this.project.title;
        } else {
            return "";
        }
    },
    getTaskTitle() {
        if (this.project && this.playingTask) {
            return this.playingTask.title;
        } else {
            return "";
        }
    },
    busy() {
        if (this.busyProject || this.working || this.busyTask) return true;
        return false;
    },
    timeWorked() {
        let hr = this.totalWorkedToday.hours;
        let mt = this.totalWorkedToday.mins;
        let m = mt < 10 ? "0" + mt : mt;
        let h = hr < 10 ? "0" + hr : hr;
        return h + ":" + m;
    },
    projectTitle() {
        if (!this.project) return "No Selected project";
        return this.project.title;
    },

    taskItemsPerPage() {
        let t = this.tasksItemsToShow;
        if (t == "all") return this.tasksList.length;
        return t;
    },
    totalTasksPages() {
        let total = this.tasksList.length;
        let perPage = this.taskItemsPerPage;
        let pages = total / perPage;
        if (pages < 0) {
            return 0;
        } else {
            let pages_total = Math.round(pages);
            if (pages > pages_total) return pages_total + 1;
            return pages_total;
        }
    },
    timerCounter() {
        let th = this.timer.h;
        let tm = this.timer.m;
        let ts = this.timer.s;

        let h = th < 10 ? "0" + th : th;
        let m = tm < 10 ? "0" + tm : tm;
        let s = ts < 10 ? "0" + ts : ts;

        return h + ":" + m + ":" + s;
    },

    timerColor() {
        if (this.working && !this.stoping) {
            return "warning";
        } else if (this.working && this.working) {
            return "primary";
        } else {
            return "primary";
        }
    },

    pauseIcon() {
        if (this.working && !this.stoping) {
            return "fa-pause";
        } else if (this.working && this.stoping) {
            return "fa-play";
        } else {
            return "";
        }
    },

    // taskStates: {
    //   get: function() {
    //     return this.allTaskStates;
    //   },
    //   set: function(obj) {
    //     Object.keys(obj).forEach((key) => {
    //       this.allTaskStates[key] = obj[key];
    //     });
    //   },
    // },
};