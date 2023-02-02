import LoginRequest from "../../requests/LoginRequest";
import OfflineHandler from "../../handlers/OfflineHandler";
import ErrorHandler from "../../handlers/ErrorHandler";
import CommonRequest from "../../requests/CommonRequest";
const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");

export default {
  data() {
    return {
      valid: true,
      username: null,
      password: null,
      busy: false,
      rules: {
        username: [(v) => !!v || "The username is required."],

        password: [(v) => !!v || "The password is required."],
      },
    };
  },

  computed: {
    noCan() {
      if (!this.valid || this.busy) return true;
      return false;
    },
  },

  methods: {
    login() {
      this.busy = true;
      let data = {
        email: this.username,
        password: this.password,
        device_name:"desktop"
      };
      OfflineHandler.CheckNetworkStatus().then((success)=>{
        LoginRequest.login(this, data);
        CommonRequest.getUserConfig();
        logger.info("Login successfully...");
      },(error)=>{
        logger.error("You have no active internet connection!");
        ErrorHandler.showError("You have no active internet connection!");
        this.busy = false;
      });
    },
  },
};
