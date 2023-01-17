export default async function(to, from, next) {
  let data = {};
  try {
	OfflineHandler.CheckNetworkStatus().then((success) => {
		let r = await axios.get("user");
		data.user = r.data.data.user;
		data.selectedAccount = r.data.data.accounts[0];
		next((vm) => vm.getUserDetails(data));
  
		localStorage.setItem("user_Offline", JSON.stringify(data.user));
		localStorage.setItem(
		  "account_Offline",
		  JSON.stringify(data.selectedAccount)
		);
	}, (error) => {
		let userOfflineData = localStorage.getItem("user_Offline");

		if (!!userOfflineData) {
		  data.user = JSON.parse(userOfflineData);
		}
  
		let accountOfflineData = localStorage.getItem("account_Offline");
		if (!!accountOfflineData) {
		  data.selectedAccount = JSON.parse(accountOfflineData);
		}
  
		next((vm) => vm.getUserDetails(data));
	});
  } catch (e) {
    ErrorHandler.render(e);
    localStorage.removeItem("token");
    window.axios.defaults.headers.common["Authorization"] = null;
    next({ name: "login" });
  }
}
