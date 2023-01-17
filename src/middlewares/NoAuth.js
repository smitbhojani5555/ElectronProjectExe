const NoAuth = (to, from, next) => {
	let token = localStorage.getItem('token')
	if(!token) {
		next()
	} else {
		next({
			name: 'dashboard'
		})
	}

}

export default NoAuth