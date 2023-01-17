export default function() {
  let data = JSON.parse(localStorage.getItem("runningPojects"));
  data.assinedProject ={};
  data.assinedTask ={};
  data.busyTask = false;
  data.idleTimeCount = 0;
  data.keepIdleFlag = false;
  data.dialog = false;
  data.confirmDialog=false;
  data.stopConfirmDialog = false;
  data.assignProjectData = {}
  return data;
}