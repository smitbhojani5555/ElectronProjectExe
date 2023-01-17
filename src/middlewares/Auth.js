
const Auth = (to, from, next) => {
	let token = localStorage.getItem('token')
	if(token) {
		next()
	} else {
		next({
			name: 'login'
		})
	}
}

export default Auth;