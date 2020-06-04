
document.addEventListener('DOMContentLoaded', () => {

	document.querySelector("#login").onload = () => {
		if (document.querySelector('.name_fill').value.length < 1)
			document.querySelector('button').disabled = true;
		else
			document.querySelector('button').disabled = false;
	};

	document.querySelector('#login').onclick = () => {
		var username = document.querySelector('.name_fill').value;

		localStorage.setItem('username',username);
	};

	if (localStorage.getItem('username'))
		var text = localStorage.getItem('username');

	else
		var text = '';

	document.querySelector('.name_fill').value= text;

});











