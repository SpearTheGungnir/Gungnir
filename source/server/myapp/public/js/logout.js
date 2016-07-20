function logout() {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open('GET', '/users/logout', true);
	xmlhttp.send();
	window.location.href = '/';
}

