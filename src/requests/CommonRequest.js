
class CommonRequest
{
	reportAnError(vm, data) {
		axios.post('report-error', data).then(r => {
		}).catch(e => {
			vm.reportAnError_Desc = "";
			ErrorHandler.render(e);
		});
		NotificationHandler.simpleSuccess("Error report sent. Thanks!")
	}

	getUserConfig() {
		axios
		  .get("neo_settings")
		  .then((res) => {
			localStorage.setItem("neo_settings",res.data.data)
		  })
		  .catch((e) => {
			ErrorHandler.render(e);
		  });
	  }
}

export default new CommonRequest()