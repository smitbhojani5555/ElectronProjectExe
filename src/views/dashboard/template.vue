<template>
    <div>
        <v-app-bar dense light style="margin-bottom: 1px; background-color:#fff;">
            <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon> -->
            <v-spacer></v-spacer>
            <v-icon style="margin-right: 10px">fa-building</v-icon>
            <span style="margin-right: 20px;font-size:13px;">{{ selectedAccount != null ? selectedAccount.name : '' }}</span>
            <v-icon style="margin-right: 10px">fa-user</v-icon>
            <span style="margin-right: 20px;font-size:13px;">{{ user !=null ? user.firstname :'' }}</span>
            <v-menu left bottom>
                <!-- <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>-->
                <template v-slot:activator="{ on }">
                    <v-btn text v-on="on">
                        <v-icon>fa-ellipsis-v</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item link disabled>
                        <v-list-item-icon>
                            <v-icon>far fa-user</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Signed in as {{ user != null ? user.firstname : '' }} {{ user != null ? user.lastname : '' }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link v-if="!working" @click="project ? (working = true) : null" :disabled="!project || busy">
                        <v-list-item-icon>
                            <v-icon>far fa-play-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Start working</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link v-if="working" @click="working = false">
                        <v-list-item-icon>
                            <v-icon>far fa-stop-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Stop working</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link @click="openLinkInBrowser(neoStaffAbout.dashboardURL)">
                        <v-list-item-icon>
                            <v-icon>fas fa-tachometer-alt</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Open Dashboard</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link @click="openLinkInBrowser(neoStaffAbout.addEditURL)">
                        <v-list-item-icon>
                            <v-icon>far fa-clock</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Add/Edit Time</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link>
                        <v-list-item-icon>
                            <v-icon>fas fa-bug</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            
                            <v-dialog
                                v-model="reportAnError.dialog"
                                persistent
                                max-width="600px"
                            >
                                <template v-slot:activator="{ on, attrs }">
                                    <v-list-item-title style="font-size:13px;"
                                    v-bind="attrs"
                                    v-on="on"
                                    >Report an Error
                                    </v-list-item-title>
                                </template>
                                <v-form ref="reportAnError_form" v-on:submit.prevent="sendReportAnError(reportAnError)">
                                    <v-card>
                                        <v-card-title>
                                            <span class="headline">Report an Error</span>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-container>
                                            <v-row>
                                                <v-col
                                                cols="12"  class="pa-0"
                                                >
                                                    <v-textarea
                                                    name="txtDescribeError"
                                                    filled
                                                    label="Describe the error"
                                                    v-model="reportAnError.error"
                                                    auto-grow
                                                ></v-textarea>
                                                </v-col>
                                            </v-row>
                                            </v-container>
                                            <small>Application configuration and log files will be sent with the report.</small>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="reportAnError.dialog = false"
                                            >
                                            Cancel
                                            </v-btn>
                                            <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="reportAnError.dialog = false"
                                            type="submit"
                                            >
                                            Send
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-form>
                            </v-dialog>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link @click="openLinkInBrowser(neoStaffAbout.supportURL)">
                        <v-list-item-icon>
                            <v-icon>far fa-question-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Help Center</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link>
                        <v-list-item-icon>
                            <v-icon>fas fa-tools</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-dialog
                                v-model="preference.dialog"
                                persistent
                                max-width="600px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-list-item-title style="font-size:13px;"
                                    v-bind="attrs"
                                    v-on="on"
                                    >Preferences...
                                    </v-list-item-title>
                                </template>
                                <v-form ref="preference_form" v-on:submit.prevent="applyPreference(preference)">
                                    <v-card>
                                        <v-card-title>
                                            <span class="headline">Preferences</span>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-container>
                                            <v-row>
                                                <v-col
                                                cols="12"  class="pa-0">
                                                    <v-checkbox
                                                    v-model="preference.screenShotTakenNotification"
                                                    label="Show notification when screenshot is taken"
                                                    class="ma-0 pa-0"
                                                    ></v-checkbox>
                                                </v-col>

                                                <v-col
                                                cols="12"  class="pa-0">
                                                    <v-checkbox
                                                    v-model="preference.startOrStopTimerNotification"
                                                    label="Show notification when starting or stopping the timer"
                                                    class="ma-0 pa-0"
                                                    ></v-checkbox>
                                                </v-col>
                                            </v-row>
                                            </v-container>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="preference.dialog = false"
                                            >
                                            Cancel
                                            </v-btn>
                                            <v-btn
                                            color="blue darken-1"
                                            text
                                            @click="preference.dialog = false"
                                             type="submit"
                                            >
                                            Apply
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-form>
                            </v-dialog>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link>
                        <v-list-item-icon>
                            <v-icon>fas fa-sync-alt</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content @click="openLinkInBrowser(neoStaffAbout.checkForUpdate)">
                            <v-list-item-title style="font-size:13px;">Check for Updates</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link>
                        <v-list-item-icon>
                            <v-icon>fas fa-info-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-dialog
                                v-model="neoStaffAbout.dialog"
                                persistent
                                max-width="400px">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-list-item-title style="font-size:13px;"
                                    v-bind="attrs"
                                    v-on="on"
                                    >About NeoStaff
                                    </v-list-item-title>
                                </template>
                                <v-card justify="center" align="center">
                                    <v-card-text>
                                        <v-flex class="mb-4 pt-4" style="width:220px;">
                                                <v-img class="mb-1" src="img/logo-dark.png" aspect-ratio="7" contain></v-img>
                                        </v-flex>
                                        <div>{{neoStaffAbout.appVerson}}</div> 
                                    </v-card-text>
                                    <v-card-text class="pa-0">
                                        <v-container>
                                        <v-row>
                                            <v-col
                                                cols="12"
                                            >
                                            <v-textarea 
                                                hide-details
                                                outlined
                                                label=""
                                                rows="5"
                                                no-resize
                                                :value="neoStaffAbout.termAndCondition"
                                            ></v-textarea>
                                            <div style="font-size:11px">{{neoStaffAbout.copyrights}}</div> 
                                            </v-col>
                                        </v-row>
                                        </v-container>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                        color="blue darken-1"
                                        text
                                        @click="neoStaffAbout.dialog = false"
                                        >
                                        Close
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item link @click="logout">
                        <v-list-item-icon>
                            <v-icon>fa-sign-out-alt</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Sign Out</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item link  @click="quitApp()">
                        <v-list-item-icon>
                            <v-icon>far fa-times-circle</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title style="font-size:13px;">Quit NeoStaff</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>
        <v-dialog v-model="closing" persistent width="300">
            <v-card color="primary" dark>
                <v-card-text>
                    Closing...
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-navigation-drawer width="420" permanent app>
            <!-- <v-toolbar :color="timerColor" dark flat dense>
    <v-spacer></v-spacer>
    <v-toolbar-title>Time Work Counter</v-toolbar-title>
    <v-spacer></v-spacer>
</v-toolbar> -->
            <br />
            <v-toolbar flat>
                <v-toolbar-items>
                    <v-tooltip bottom v-if="working">
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon @click="working = false">
                                <v-icon :color="timerColor" style="font-size:28px;">far fa-stop-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Stop</span>
                    </v-tooltip>
                    <v-tooltip bottom v-else>
                        <template v-slot:activator="{ on }">
                            <v-btn v-on="on" icon @click="project ? (working = true) : null" :disabled="!project || busy">
                                <v-icon color="primary" style="font-size:28px;">far fa-play-circle</v-icon>
                            </v-btn>
                        </template>
                        <span>Start</span>
                    </v-tooltip>
                </v-toolbar-items>
                <v-spacer></v-spacer>
                <v-text-field prepend-inner-icon="far fa-clock" :append-icon="pauseIcon" @click:append="working = false" class="counter-timer" v-model="timerCounter" :background-color="timerColor" dark outlined hide-details dense readonly></v-text-field>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-divider></v-divider>
            <v-toolbar flat dense>
                <v-spacer></v-spacer>
                <v-toolbar-title>
                    <h3 style="margin-top:15px;font-size:16px;">{{ getProjectTitle }}</h3>
                    <h5 style="text-align: center">{{ getTaskTitle }}</h5>
                </v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-toolbar flat dense>
                <v-spacer></v-spacer>
                <v-toolbar-title>
                    <v-subheader>Total worked today {{ timeWorked }}</v-subheader>
                </v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-toolbar flat dense>
                <v-text-field prepend-inner-icon="fa-search" height="small" label="Search project" v-model="searchProject" outlined dense hide-details color="info"></v-text-field>
            </v-toolbar>
            <v-toolbar flat dense dark style="background-color:#0d47a1;height:40px;">
                <v-toolbar-title>Projects List</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <v-btn v-on="on" :disabled="busy" @click="getProjects" icon>
                            <v-icon>fa-redo-alt</v-icon>
                        </v-btn>
                    </template>
                    <span>Update List</span>
                </v-tooltip>
            </v-toolbar>
            <v-divider class="mb-2"></v-divider>
            <v-data-table class="project-table" :loading="busyProject" :headers="[{ text: '', value: 'title' }]" :search="searchProject" height="330" :items="projectsList" :items-per-page="projectsList != null ? projectsList.length : 0
            " hide-default-footer hide-default-header loading-text="Loading...">
                <template v-slot:item.title="{ item }">
                    <v-toolbar  flat dense :dark="projectSelected == 'project-sel-' + item.id" v-bind:style="projectSelected == 'project-sel-' + item.id ? 'background-color:#0d47a1' : ''">
                        <v-toolbar-items>
                            <v-tooltip v-if="working && projectSelected == 'project-sel-' + item.id" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" @click="working = false" icon>
                                        <v-icon>fa-pause</v-icon>
                                    </v-btn>
                                </template>
                                <span>Stop</span>
                            </v-tooltip>
                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" @click="selectProject(item, true)" icon :disabled = "working">
                                        <v-icon>fa-play</v-icon>
                                    </v-btn>
                                </template>
                                <span>Start</span>
                            </v-tooltip>
                        </v-toolbar-items>
                        <v-list-item @click="selectProject(item, false)" link :disabled="working && projectSelected !== 'project-sel-' + item.id">
                            <v-toolbar-title>
                                <h6>{{ item.title }}</h6>
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-chip class="mr-2">{{ item.time }} </v-chip>
                        </v-list-item>
                    </v-toolbar>
                </template>
            </v-data-table>
        </v-navigation-drawer>
        <v-content>
            <!-- <v-toolbar dark flat dense>
        <v-spacer></v-spacer>
        <v-toolbar-title>Tasks</v-toolbar-title> -->
            <!-- <v-toolbar-items>
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn text v-on="on">
                <v-icon>fa-ellipsis-v</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item link @click="logout">
                <v-list-item-icon>
                  <v-icon>fa-sign-out-alt</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Sign Out</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar-items>-->
            <!-- <v-spacer></v-spacer>
</v-toolbar> -->
            <v-container fluid>
                <v-sheet>
                    <v-subheader>
                        <v-col cols="12" class="pt-1" style="margin-top:10px;"><b class="mr-2" style="font-size:15px;">Tasks</b><br />{{ projectTitle }}<br /></v-col>
                    </v-subheader>
                    <v-row justify="space-around" style="margin-top:5px;">
                        <v-col cols="4">
                            <v-select label="See Tasks:" hide-details dense outlined v-model="tasksItemsToShow" :items="tasksItemsPerPageList"></v-select>
                        </v-col>
                        <v-col cols="3" class="pt-1">
                            <v-checkbox label="Show completed" v-model="tasksCompleted" class="pt-0" hide-details></v-checkbox>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field prepend-inner-icon="fa-search" label="Search task:" hide-details dense outlined v-model="searchTask"></v-text-field>
                        </v-col>
                    </v-row>
                </v-sheet>
            </v-container>
            <v-divider></v-divider>
            <v-container>
                <v-row align="center" v-if="!busyTask && (tasksList != null && tasksList.length == 0)">
                    <v-col cols="12" style="margin-top:10%;">
                        <v-row justify="center">
                            <v-icon x-large>fa-tasks</v-icon>
                        </v-row>
                        <v-row justify="center">
                            <v-subheader>There're not tasks avaliable.</v-subheader>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row justify="center" v-if="busyTask">
                    <v-col cols="8">
                        <v-progress-linear indeterminate></v-progress-linear>
                        <v-row justify="center">
                            <v-subheader>Loading...</v-subheader>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row v-if="!busyTask && (tasksList != null && tasksList.length > 0)">
                    <v-col cols="12">
                        <v-toolbar flat dense>
                            <v-spacer></v-spacer>
                            <v-pagination v-model="tasksPage" :length="totalTasksPages" v-if="tasksItemsToShow != 'all'"></v-pagination>
                            <v-spacer></v-spacer>
                        </v-toolbar>
                        <v-sheet>
                            <v-row>
                                <v-col cols="12">
                                    <v-data-table :page.sync="tasksPage" :headers="tasksTableHeaders" :search="searchTask" height="370" :items="tasksList" :items-per-page="taskItemsPerPage" hide-default-footer>
                                        <template v-slot:item.title="{ item }">
                                            <v-list-item dense link @click="selectTask(item, false)" :disabled="item.completed == 1">
                                                <v-icon class="mr-2" color="success" v-if="taskSelected == 'task-sel-' + item.id" small>fa-check-circle</v-icon>
                                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                                            </v-list-item>
                                        </template>
                                        <template v-slot:item.details="{ item }">
                                            <v-menu max-width="200" offset-y nudge-left="10">
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-on="on" icon>
                                                        <v-icon color="info">fa-info-circle</v-icon>
                                                    </v-btn>
                                                </template>
                                                <v-card>
                                                    <v-card-title>Description:</v-card-title>
                                                    <v-card-text>{{ item.description }}</v-card-text>
                                                </v-card>
                                            </v-menu>
                                        </template>
                                        <template v-slot:item.completed="{ item }">
                                            <v-tooltip top>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon v-on="on" v-if="item.completed == 1" color="success">fa-check-double</v-icon>
                                                </template>
                                                <span>Completed</span>
                                            </v-tooltip>
                                            <v-tooltip top>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon v-on="on" v-if="item.completed == 0" color="warning">fa-exclamation-triangle</v-icon>
                                                </template>
                                                <span>Pending</span>
                                            </v-tooltip>
                                        </template>
                                        <template v-slot:item.actions="{ item }">
                                            <div v-if="!item.completed">
                                                <v-tooltip v-if="taskPlayed == 'task-sel-' + item.id && working" top>
                                                    <template v-slot:activator="{ on }">
                                                        <v-btn class="mr-2" v-on="on" @click="working = false" icon>
                                                            <v-icon color="warning">fa-pause</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Pause</span>
                                                </v-tooltip>
                                                <v-tooltip top v-else>
                                                    <template v-slot:activator="{ on }">
                                                        <!-- :disabled="!stoping && taskSelected && taskSelected !== 'task-sel-'+item.id && working && taskSelected" -->
                                                        <v-btn class="mr-2" v-on="on" @click="selectTask(item, true)" icon :disabled="working == true">
                                                            <v-icon color="primary">fa-play</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Start</span>
                                                </v-tooltip>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on }">
                                                        <!-- :disibled="disibleComplete(item.id)" -->
                                                        <v-btn @click="completeTask(item)" :disabled="
                                (working &&
                                  taskSelected !== 'task-sel-' + item.id &&
                                  !stoping) ||
                                  (!stoping &&
                                    working &&
                                    taskSelected == 'task-sel-' + item.id)
                              " icon>
                                                            <!-- v-on="on" -->
                                                            <!-- taskStates[item.id] -->
                                                            <v-icon :color="
                                  !taskStates[item.id] ? 'info' : 'default'
                                ">fa-check</v-icon>
                                                        </v-btn>
                                                    </template>
                                                    <span>Mark as completed</span>
                                                </v-tooltip>
                                            </div>
                                        </template>
                                    </v-data-table>
                                </v-col>
                            </v-row>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </v-content>
        <v-footer app>
            <v-spacer></v-spacer>
            <v-subheader>{{neoStaffAbout.copyrights}}</v-subheader>
            <v-spacer></v-spacer>
        </v-footer>
    </div>
</template>
<script src="./script.js">

</script>
<style>
@import "style.css";
</style>