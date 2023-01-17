import OfflineHandler from "../handlers/OfflineHandler";
const { remote } = window.require("electron");
const app = remote.app;
const fs = remote.require("fs");
const path = window.require("path");
const tmpDir = path.join(app.getPath("temp"), "./neoStaff_tmp");

class ProjectRequest {
  index(vm) {
    
    OfflineHandler.CheckNetworkStatus().then(
      (success) => {
        axios
          .get(`accounts/${vm.selectedAccount.id}/projects`)
          .then((r) => {
            vm.projectsList = r.data.data;

            //TODO: saved data for offline operation
            const fileName = "./projectsList_Offline";

            fs.writeFile(
              path.join(tmpDir, fileName + ".txt"),
              JSON.stringify(vm.projectsList),
              function(err) {
                if (err) {
                  console.log(err);
                  return;
                }
              }
            );

            vm.$nextTick(() => {
              vm.getProjectsTimeToday();
              vm.busyProject = false;
            });
          })
          .catch((e) => {
            ErrorHandler.render(e);
            vm.busyProject = false;
          });
      },
      (error) => {
        // TODO: get projects from localStorage
        fs.readdir(tmpDir, (err, files) => {
          if (err) {
            return console.log("Unable to scan directory: " + err);
          }

          let projectList = files.filter(
            (file) => file == "projectsList_Offline.txt"
          );

          if (projectList.length > 0) {
            let fileName = path.join(tmpDir, projectList[0]);

            fs.readFile(fileName, "utf8", (err, data) => {
              if (err) {
                console.log(data);
                return;
              }

              let _dataObj = JSON.parse(data);

              vm.projectsList = _dataObj;
              vm.$nextTick(() => {
                vm.getProjectsTimeToday();
              });
              vm.busyProject = false;
            });
          }
        });
      }
    );
  }

  tasks(vm, id) {
    OfflineHandler.CheckNetworkStatus().then(
      (success) => {
        axios
          .get(`accounts/${vm.selectedAccount.id}/projects/${id}/tasks`)
          .then((r) => {
            vm.$nextTick(() => {
              let totalTasks = r.data.data;
              if (vm.tasksCompleted) {
                vm.tasksList = totalTasks;
              } else {
                let tasks = [];
                $.each(totalTasks, (i, t) => {
                  if (!t.completed) tasks.push(t);
                });
                vm.tasksList = tasks;
              }
              vm.totalTasks = totalTasks;
              vm.busyTask = false;
              // vm.taskSelected = totalTasks[0] ? "task-sel-" + totalTasks[0].id : "";
              // vm.task = totalTasks[0];
            });
          })
          .catch((e) => {
            ErrorHandler.render(e);
            vm.busyTask = false;
          });
      },
      (err) => {
        // TODO: get tasks from localStorage
        vm.totalTasks = [];
        vm.busyTask = false;
      }
    );
  }

  async completeTask(vm, id) {
    try {
      let r = await axios.get(
        `accounts/${vm.selectedAccount.id}/tasks/${id}/complete`
      );
      return r;
    } catch (e) {
      ErrorHandler.render(e);
      return null;
    }
  }
}

export default new ProjectRequest();
