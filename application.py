import os

from flask import Flask, render_template, request, jsonify
from flask_session import Session
from flask_socketio import SocketIO, emit
import requests



app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)

 #variables for channels and messages
channels = {}
channels['Main']=[]
listc=[]
listc.append('Main')

#input your username
@app.route("/", methods=['GET'])
def index():
	return render_template('index.html')

#chatting room
@app.route("/chat", methods=['POST','GET'])
def chat():

	if request.form.get('username') == '':
		return render_template('index.html')
	return render_template('chat.html', listc=listc)

#download all channels, and messages from selected channel
@app.route("/loadmain", methods = ['POST'])
def loadmain():
	data = request.form.get('channel')
	if data not in listc:
		data = 'Main'
	messages = channels[data]
	main={"messages":messages, "channels":listc, "current_channel":data}
	return jsonify(main)

#when change channel, import messages from that channel
@app.route('/importmessages', methods=["POST"])
def importmessages():
	data1 = request.form.get("channel")
	print(f"import messages request for {data1}")
	if data1 is None:
		messages = []
	else:
		messages = channels[data1]
	return jsonify(messages)


#check if channel exists when creating a  new one
@app.route("/checknewchannel", methods=["POST"])
def checknewchannel():
	data = request.form.get('channel')
	print(f'new channel request for {data}')
	error = ''
	if data in listc:
		error="Channel already exists"
	elif data == '':
		error="Channel cannot be empty"
	print(f"error message \"{error}\"")
	return jsonify(error)
	

#real time new channel emit
@socketio.on("new channel")
def channel(data):
	print(f'New channel request with -----{data["channel"]}-----')
	channels[data["channel"]]=[]
	listc.append(data["channel"])
	new_channel = data["channel"]
	emit("announce channel", {"channels":new_channel}, broadcast=True)

#real time dete channel
@socketio.on("delete channel")
def delete_channel(data):
	channel = data["channel"]
	print (f"Delete channel request for \"{channel}\" channel")
	if channel == 'Main':
		yes = 0
	else:
		listc.remove(channel)
		channels.pop(channel, None)
		yes=1
	emit("channel deleted",{"yes":yes, "channel":channel, "listc":listc}, broadcast=True)


#real time new message emit
@socketio.on("new message")
def message(data):
	delete = 0
	date = data["date"]
	username = data["username"]
	new_message = data["message"]
	channel = data["channel"]
	message = {"message":new_message, "username":username, "date":date}
	channels[channel].append(message)
	if len(channels[channel])>100:
		channels[channel].pop(0)
		delete = 1
	emit("announce message", {"message":message, "channel":channel, "delete":delete}, broadcast=True)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')





