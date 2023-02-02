export default function() {
  let data = {
    closing: false,
    working: false,
    stoping: true,
    totalWorkedToday: {
      date: new Date().toLocaleDateString(),
      hours: 0,
      mins: 0,
    },
    timePassed: {
      date: new Date().toLocaleDateString(),
      time: 0,
    },
    lastScreenshot: 0,
    timer: {
      h: 0,
      m: 0,
      s: 0,
      passed: 0
    },
    busyProject: false,
    projectSelected: null,
    projectPlayed: null,
    projectsList: [],
    searchProject: null,
    projectsWorkedToday: {
      date: new Date().toLocaleDateString(),
      items: [],
    },
    project: null,
    selectedProject: null,
    busyTask: false,
    tasksItemsToShow: 20,
    tasksList: [],
    totalTasks: [],
    tasksTableHeaders: [
      {
        text: "Title",
        value: "title",
      },
      {
        text: "Details",
        value: "details",
        sortable: false,
      },
      {
        text: "Status",
        value: "completed",
        sortable: false,
        align: "center",
      },
      {
        text: "",
        value: "actions",
        sortable: false,
      },
    ],
    tasksItemsPerPageList: [
      {
        text: "All tasks",
        value: "all",
      },
      {
        text: "5",
        value: 5,
      },
      {
        text: "10",
        value: 10,
      },
      {
        text: "20",
        value: 20,
      },
      {
        text: "50",
        value: 50,
      },
      {
        text: "100",
        value: 100,
      },
    ],
    tasksCompleted: false,
    tasksPage: 1,
    searchTask: null,
    taskSelected: null,
    taskPlayed: null,
    task: null,
    playingTask: null,
    completingTask: false,
    selectedAccount:null,
    company: {},
    user: {},
    firstCaptured: false,
    allTaskStates: {},
    taskStates: {},
    total_active_time:0,
    total_mouse_event:0,
    total_key_event:0,
    mouse_event:0,
    total_activity_percentage:0,
    key_event:0,
    idleModeActivated:false,
    reportDialog:false,
    screenshotCaptured: false,
    screenshotCapturedTime:0,
    neoStaffAbout:{
      appVerson:0,
      appName:"",
      dialog:false,
      termAndCondition:"Term and condition of neoStaff",
      copyrights:"Neostaff © Copyright 2023."
    },
    reportAnError:{
      userId:0,
      error:"",
      IP:"0.0.0.0",
      dialog:false
    },
    preference:{
      screenShotTakenNotification:true,
      startOrStopTimerNotification:true,
      dialog:false
    },
    cloneWorkLogs:{
      t_a_time:0,
      t_m_event:0,
      t_k_event:0,
      t_a_percentage:0,
      t_t_passed:0
    }
  };

  return data;
}
