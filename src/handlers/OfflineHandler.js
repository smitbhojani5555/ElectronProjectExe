const { remote } = window.require("electron");
const dns = remote.require("dns");
const { parse } = remote.require("url");

let url = "https://www.google.com/";
class OfflineHandler {
  CheckNetworkStatus() {
    return new Promise((resolve, reject) => {
      const { protocol } = parse(url);
      const lib =
        protocol === "https:"
          ? remote.require("https")
          : remote.require("http");
      const request = lib.get(url, (response) => {
        resolve(response);
      });
      request.on("error", (err) => {
        reject(err);
      });
    });
  }
}
export default new OfflineHandler();
