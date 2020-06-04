# Project 2

Web Programming with Python and JavaScript


This is FLACK a web messaging service working on Python, in a Flask framework. Using HTML, CSS, and  JavaScript to create responsive website and real time messaging between users.

The website has a minimalistic view so you can focus on messaging, without distractions. It is responsive so if you are in a smaller screen or a smartphone it will display properly.

The first thing you find is that you are prompted to a page that allows you to choose a name (this is not a username, so you can go back and change it anytime you want, as to create an anonymous chatting room)

Once you pick your name, you are taken to the chat room. The page will display your name and the channel you are currently in at the top. If you have never been logged before of the channel you were previously doesn't exist anymore, you will be directed to channel 'Main'. This channel is created in the server and cannot be deleted. It works as the main, frontpage of the chatting room

From there you can navigate through the different channels, create new ones, and chat with other people inside the channels. For every message, it is displayed the username that sent it and the time and date of the message.

For creating a channel, the page makes a XMLHttpRequest to check if the channel exists or if the channel name is empty. If not, it will return an error message only to you. If it passes the check, it will emit the channel name to the server that will store the name in the channel list and send the name to every client. Once there, the channel is added to the list of channes at the left of the page.

When select a different channel. The page makes a XMLHttpRequest to download all the messages from that channel. Everytime you type a message, it emits it to the server, which stores it in a list under the channel's name and emits the new message.

You can delete channels from the list, but not Main. If you delete a channel, the channel is deleted from the list of channels, the messages list is deleted as well and the new channel list is emited to all the clients. If any of the clients are in the channel that was deleted, it will take you to the Main channel automatically.

If you close the page and reload it, you will be taken to the same channel with the same username that you were before. That is because those values are stored in the browser using localStorage in Javascript. You can allways change your username by clicking your name at the top of the page.