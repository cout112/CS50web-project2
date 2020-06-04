


var current_channel = localStorage.getItem('channel');
document.addEventListener('DOMContentLoaded', () => {


	document.querySelector('.username').innerHTML=localStorage.getItem('username');
	//check_channel();
	load_main();


	let columnheight = window.innerHeight - 150;
	document.querySelector('#channelscolumn').style.height = `${columnheight}px`;
	columnheight = columnheight - 50;
	document.querySelector('#overflow').style.height = `${columnheight}px`;
	columnheight =window.innerHeight - 200;
	document.querySelector('#overflow1').style.height = `${columnheight}px`;
	//let windowwidth = window.matchMedia("(max-width: 992px)");
	//if (windowwidth.matches){
	//	console.log(`detected narrow window`);
	//	columnheight = window.innerHeight - 50;
	//	document.querySelector('#overflow1').style.height = `${columnheight}px`;
	//}

	
	document.addEventListener('click', event => {

        const element = event.target;
        if (element.className === 'btn importmessages'){
			let list = document.querySelector('.messages');
			while (list.firstChild) {
                  list.removeChild(list.firstChild);
                }
        	const channel = element.innerHTML;
        	localStorage.setItem('channel', channel);
        	current_channel = localStorage.getItem('channel');
        	document.querySelector('.current_channel').innerHTML=current_channel;
        	const request = new XMLHttpRequest();
        	request.open('POST', '/importmessages');
			request.onload = () =>{
				const data = JSON.parse(request.responseText);
				let i;
				for (i = 0; i<data.length; i++){
					add_message(data[i]);
				};
			};
			const data = new FormData();
			data.append('channel', current_channel);
			request.send(data);
        };


    });


	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);


	socket.on('connect', () => { 


		document.addEventListener('click', event => {
			const element = event.target;
			if (element.className === 'btn remove') {
	        	//right now it justs deletes the option from your browser.
	        	let rowcode = element.parentElement; //.innerHTML.querySelector('.btn importmessages').innerHTML;
	        	let channel = rowcode.firstChild;
	        	let channel_name = channel.nextElementSibling.firstChild.nodeValue;
	        	console.log(`Order to delete channel ${channel_name}`);
	        	socket.emit("delete channel", {"channel":channel_name});
	        };
        });

		
		document.querySelector('button.btn.new_channel').onclick = () =>{
			let request = new XMLHttpRequest();
			request.open('POST', '/checknewchannel', true);
			request.onload = () =>{
				console.log(`New channel http request received`);
				let data = JSON.parse(request.responseText);
				if (data !== ''){
					const error_message = Handlebars.compile(document.querySelector('#error_alert').innerHTML);
					const post_e = error_message({'data':data});
					document.querySelector('.alertmessage').innerHTML = post_e;
					document.querySelector('input.channel_name.rounded-lg').value = '';
				}else{
					let alertmessage = document.querySelector(".alertmessage");
					while (alertmessage.firstChild) {
						
                  		alertmessage.removeChild(alertmessage.firstChild);
                	};
                	let channel = document.querySelector('input.channel_name.rounded-lg').value;
                	document.querySelector('input.channel_name.rounded-lg').value = '';
                	socket.emit("new channel", {"channel":channel});
				};
			};
			data = new FormData();
			let channel = document.querySelector('input.channel_name.rounded-lg').value;
			data.append('channel', channel);
			request.send(data);


		};
		

		document.querySelector('.btn.new_message').onclick = () => {  
			let d = new Date(); 
			let year = d.getFullYear();
			let month = d.getMonth();
			let day =  d.getDate();
			let hours= d.getHours();
			let minutes = d.getMinutes();
			let date = `${hours}:${minutes} ${day}/${month}/${year}`;    		
      		let message = document.querySelector('.message').value;
      		let channel = localStorage.getItem('channel');
      		let username =  localStorage.getItem('username');
            socket.emit("new message", {'message': message, "channel":channel, "username":username, "date":date});
            document.querySelector('.message').value = '';
        };

    });

	socket.on("channel deleted", data =>{

		if (data.yes === 1){
			//delete_channel();
			console.log(`delete channel function called`);
			let channels = document.querySelector(".channels");
			while (channels.firstChild) {
                  channels.removeChild(channels.firstChild);
                
			}; 
			let channels_received = data.listc;
			let i;
			for (i = 0; i < data.listc.length; i++) {
			  	add_channel(data.listc[i]);
			};
			let current_channel = localStorage.getItem('channel'); 
			console.log(`if channel received:${data.channel} is ${current_channel} change to main`);
			if (data.channel === current_channel){

				localStorage.setItem('channel', 'Main');
				let Main = localStorage.getItem('channel');
				document.querySelector(".current_channel").innerHTML = Main;
				console.log(`current channel  changed to main`);
				const request = new XMLHttpRequest();
				request.open('POST', '/importmessages', true);
				request.onload = () =>{
					console.log(`import messages received data`);
					let list = document.querySelector('.messages');
					while (list.firstChild) {
		                  list.removeChild(list.firstChild);
		                }
					const data1 = JSON.parse(request.responseText);
					let i;
					for (i = 0; i<data1.length; i++){
					add_message(data1[i]);
					}
				};
				const data = new FormData();
				data.append("channel", Main);
				request.send(data);
			};
		};
	});


	socket.on("announce message", data => {
		current_channel= localStorage.getItem('channel');
		if (data.channel == current_channel){
			add_message(data.message); 
			if (data.delete === 1){
				let message=document.querySelector('.messages');
				message.removeChild(message.firstChild);
			};
		}; 

    });

	socket.on("announce channel", data => {
		if (data.channels){
		add_channel(data.channels);
		let alertmessage = document.querySelector('.alertmessage');
		while (alertmessage.firstChild) {
                  alertmessage.removeChild(alertmessage.firstChild);
                };
		};  
    });


	const channel_template = Handlebars.compile(document.querySelector('#channel_post').innerHTML);
    function add_channel(data) {
    	const post_c = channel_template({'data':data});
    	document.querySelector('.channels').innerHTML += post_c;
    };
    const message_template = Handlebars.compile(document.querySelector('#message_post').innerHTML);
    function add_message(data) {
    	let username = localStorage.getItem('username');
    	let righttext = '';
    	if (username === data.username){
    		righttext = 'justify-content-end';
    	}
    	const post_m = message_template({'message':data.message, "date":data.date, "username":data.username, "righttext":righttext});
    	document.querySelector('.messages').innerHTML += post_m;
    	let messageswindows = document.querySelector('.messages');
    	messageswindows.scrollTop = messageswindows.scrollHeight - messageswindows.clientHeight;
    };


    function load_channels() { 
		const request = new XMLHttpRequest();
		request.open('POST', '/allchannels');
		request.onload = () => {
			const data = JSON.parse(request.responseText);
			let i;
			for (i = 0; i < data.length; i++) {
			  	add_channel(data[i]);
			};
		};
		request.send();
		console.log(`load channels from server done`);
	};


    function check_channel(){
    	let current_channel = localStorage.getItem('channel');
    	console.log(`current channel is ${current_channel}`)
    	const request = new XMLHttpRequest();
		request.open('POST', '/checkchannel', true);
		request.onload = () =>{
			const data = JSON.parse(request.responseText);
				if (data.itexists === 0){
					localStorage.setItem('channel', 'Main');
					let check =localStorage.getItem('channel');
					document.querySelector('.current_channel').innerHTML=check;
				}
		};
    	const data = new FormData();
		data.append('channel', current_channel);
		request.send(data);
		console.log(`check channel done`);
    };

	
	function  load_main(){
		let current_channel = localStorage.getItem('channel');
		if (current_channel === ''){
			localStorage.setItem('channel', 'Main');
		}
		current_channel = localStorage.getItem('channel');
		//if (current_channel === 'Main'){
		//	document.querySelector(".current_channel").innerHTML = current_channel;
		//}
		let request = new XMLHttpRequest();
		request.open('POST', '/loadmain', true);
		request.onload = () =>{
			let data = JSON.parse(request.responseText);
			document.querySelector(".current_channel").innerHTML = data.current_channel;
			let i;
			for (i = 0; i<data.messages.length; i++){
				add_message(data.messages[i]);
			};
			for (i = 0; i<data.channels.length; i++){
				add_channel(data.channels[i]);
			};
		}
		let data = new FormData();
		data.append('channel', current_channel);
		request.send(data);
	};
	

//    socket.on(socket.on('connect', () => { 
//        document.querySelector('.new_message').onclick = () => {        		
//      		let channel = document.querySelector('.channel_name').value;
//            socket.emit("new channel", {'channel': channel});
//            channel='';
//            document.querySelector('.channel_name').value = '';
//        };
//    });
});





