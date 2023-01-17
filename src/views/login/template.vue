<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row justify="center" align="center">
        <v-col cols="10" sm="8" md="6" lg="4">
          <v-form v-model="valid" ref="login_form" v-on:submit.prevent="login">
            <v-sheet>
              <v-img class="mb-1" src="img/logo-dark.png" aspect-ratio="7" contain></v-img>
              <v-toolbar flat>
                <v-spacer></v-spacer>
                <v-toolbar-title>Login</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-text-field
                  label="Email"
                  :disabled="busy"
                  v-model="username"
                  :rules="rules.username"
                  required
                ></v-text-field>

                <v-text-field
                  :disabled="busy"
                  label="Password"
                  type="password"
                  v-model="password"
                  :rules="rules.password"
                  required
                ></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :disabled="noCan" type="submit" color="primary" depressed>Login</v-btn>
                <v-spacer></v-spacer>
                <v-btn href="https://www.neostaff.app/forgotpassword" target="_blank" color="warning" outlined>Forgot Password</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-sheet>
          </v-form>
        </v-col>
      </v-row>
      <v-dialog v-model="busy" persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            Accessing...
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-container>
  </v-content>
</template>

<script src="./script.js"></script>
<style>
@import "style.css";
</style>