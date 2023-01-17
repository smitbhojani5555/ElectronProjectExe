export default {
  timePassed(val) {
    localStorage.setItem("projectsWorkedToday", JSON.stringify(val));
  },
  tasksCompleted(val) {
    let totalTasks = this.totalTasks;
    if (val) {
      this.tasksList = totalTasks;
    } else {
      let tasks = [];
      $.each(totalTasks, (i, t) => {
        if (!t.completed) tasks.push(t);
      });
      this.tasksList = tasks;
    }
  },
  timeScreen(val) {
    localStorage.setItem("timeScreen", val);
  },
  async working(val) {
    if (!this.working) {
      this.stoping = true;
      this.stop();
      // let msj = 'Do you want to stop really?'
      // let r = await NotificationHandler.confirm(msj)
      // if(r) {
      // 	this.stop()
      // } else {
      // 	this.stoping = false
      // 	this.working = true
      // }
    } else {
      this.stoping = false;
      this.start();
      /*let win = this.$electron.remote.getCurrentWindow()
			win.minimize()*/
    }
  },
  allTaskStates(param1) {
    this.taskStates = param1;
  },
};
