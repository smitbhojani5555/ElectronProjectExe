const log4js = window.require("log4js");
const logger = log4js.getLogger("neostaff");

class LoginRequest
{
	login(vm, data) {
		axios.post('login', data).then(r => {
			let token = r.data.data.token
			localStorage.setItem('token', token)
			window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
			vm.$router.push({
				name: 'dashboard'
			});
		}).catch(e => {
			vm.password = null
			vm.$refs.login_form.resetValidation()
			vm.busy = false
			ErrorHandler.render(e)
			logger.error("Login APIs: " + JSON.stringify(e));
		})
	}

	async logout() {
		try {
			let r = await axios.post('logout')
			if(r.data.message)
				NotificationHandler.simpleSuccess(r.data.message)
			return r
		} catch(e) {
			return true
		}
	}
}

export default new LoginRequest()