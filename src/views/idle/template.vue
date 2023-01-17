<template>
  <v-main>
    
    <v-container fluid>
      <v-row justify="center" align="center">
        <v-col
         cols="12">
        <v-form>
            <v-sheet>
                  <v-subheader>You have been idle for {{idleTimeCount}} minutes</v-subheader>
                  <v-subheader>Project: {{ !!selectedProject && selectedProject.title }}</v-subheader>
                  <v-spacer class="mt-10"></v-spacer>
                  <v-checkbox
                  v-model="keepIdleFlag"
                  label="Keep idle time"
                  class="ma-0 pa-0"
                ></v-checkbox>
                <v-spacer class="mt-"></v-spacer>
                <v-card-actions class="ma-0 pa-0">
                  <v-col align="left" class="ma-0 pa-0">

                    <!-- Assign project dialog -->
                    <v-dialog
                    v-model="dialog"
                    persistent
                    max-width="600px"
                  >
                  <template v-slot:activator="{ on, attrs }">
                  <v-btn 
                    small
                    v-on="on"
                    v-bind="attrs"
                    :disabled="!keepIdleFlag ? '' : false"
                    >
                    Reassign idle time
                  </v-btn>
                  </template>
                  <v-card>
                    <v-overlay
                    :absolute="true"
                    :value="busyTask"
                    >
                      <v-progress-circular
                      indeterminate
                      color="primary"
                      >
                      </v-progress-circular>
                    </v-overlay>
                    <v-card-title class="ma-0 pa-3">
                      <span>Reassign idle time to</span>
                    </v-card-title>
                    <v-card-text class="ma-0 pa-0">
                      <v-container>
                        <v-row>
                          <v-col
                            cols="12"
                          >
                            <v-select
                              dense
                              v-model="assinedProject"
                              :items="projectsList"
                              item-text="title"
                              item-value="id"
                              label="Project"
                              @change="selectProject"
                              required
                            ></v-select>
                          </v-col>
                          <v-col
                            cols="12"
                          >
                            <v-select
                              dense
                              v-model="assinedTask"
                              :items="tasksList"
                              item-text="title"
                              item-value="id"
                              label="Task"
                            ></v-select>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        small
                        color="blue darken-1"
                        text
                        @click="dialog = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        small
                        color="blue darken-1"
                        text
                        @click="assignProject"
                      >
                        Assign
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                    </v-dialog>

                    <!-- confirm dialog  -->
                    <v-dialog ref="confirmDlg"
                      v-model="confirmDialog"
                      max-width="400"
                      style="{ zIndex: 200 }"
                      @keydown.esc="cancelConfim"
                    >
                    <v-card>
                      <v-toolbar dark color="grey lighten-3" dense flat>
                        <v-toolbar-title class="text-body-2 font-weight-bold grey--text">
                          Confirm
                        </v-toolbar-title>
                      </v-toolbar>
                      <v-card-text
                        class="pa-4 black--text"
                      >
                      Are you sure you want to cotinue without keepIdle data?
                      </v-card-text>
                      <v-card-actions class="pt-3">
                        <v-spacer></v-spacer>
                        <v-btn
                          small
                          color="grey"
                          text
                          class="body-2 font-weight-bold"
                          @click.native="cancelConfim"
                          >Cancel</v-btn
                        >
                        <v-btn
                          small
                          color="primary"
                          class="body-2 font-weight-bold"
                          outlined
                          @click.native="agreeWithoutKeepIdle"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                    </v-dialog>

                      <!-- confirm dialog  -->
                    <v-dialog ref="stopconfirmDlg"
                      v-model="stopConfirmDialog"
                      max-width="400"
                      style="{ zIndex: 200 }"
                    >
                    <v-card>
                      <v-toolbar dark color="grey lighten-3" dense flat>
                        <v-toolbar-title class="text-body-2 font-weight-bold grey--text">
                          Confirm
                        </v-toolbar-title>
                      </v-toolbar>
                      <v-card-text
                        class="pa-4 black--text"
                      >
                      Do you want to stop idle reminder?
                      </v-card-text>
                      <v-card-actions class="pt-3">
                        <v-spacer></v-spacer>
                        <v-btn
                          small
                          color="grey"
                          text
                          class="body-2 font-weight-bold"
                          @click.native="stop"
                          >No</v-btn
                        >
                        <v-btn
                          small
                          color="primary"
                          class="body-2 font-weight-bold"
                          outlined
                          @click.native="neverReminderForIdle"
                          >Yes</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                    </v-dialog>
                  </v-col>
                  <v-col align="right" class="ma-0 pa-0">
                    <v-btn small color="normal" depressed class="mx-1"  @click="stopInterval" :disabled="keepIdleFlag ? '' : false">Stop</v-btn>
                    <v-btn small color="normal" depressed class="mx-1" @click="continueInterval">Continue</v-btn>
                  </v-col>
                </v-card-actions>
            </v-sheet>
          </v-form>
      </v-col>
     
      </v-row>
    </v-container>
  </v-main>
</template>


<script src="./script.js"></script>
<style>
@import "style.css";
</style>