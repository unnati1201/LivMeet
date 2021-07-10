# <img src="https://github.com/unnati1201/LivMeet/blob/main/public/favicon.ico" width="48" height="48"/> LivMeet

LivMeet is a video-communication web application with a additional feature of group messaging. The application is intended to make the virtual communication between people seamless.

To check this web app out, head over to : https://liv-meet.herokuapp.com/.

## Objective

The objective of this web app is to provide a platform for face-to-face communication from anywhere, anytime.

## Features

#### Video Conferencing

1. A user can connect with upto EIGHT users at once.
2. The user can join a meeting through a unique meeting ID, or create a new meeting with one click.
3. **Mute/Unmute** - Users can Mute or Unmute themselves while video-calling.
4. **Camera On/Off** - Users can turn their camera On or Off, as per convenience.
5. **Share Screen** - Screen-sharing can be performed by the user, which aids in collaboration.
6. **Share Meeting Id** - Each meeting has a unique meeting ID, that can be copied by a user for sharing, or emailed to other users directly.
7. **Raise Hand** - A participant can use the 'Raise your hand' feature to attract attention to themselves. Their video thumbnail becomes highlighted with yellow borders.
8. **Know Who is Speaking** - Voice Detection lets other participants quickly notice the ones who are speaking, since the speakers' video thumbnail gets highlighted with blue borders.
9. **Participant List** - Every participant can view a list of other participants who are present in the meeting.
10. **Chat** - A user can also chat with the participants through the messaging window.
11. **Breakout Rooms** - Breakout rooms can be created, which are essentially sub-meetings in a meeting. The host can divide participants into breakout rooms & make announcements in all of them.

#### Group Chat

1. **Build Groups** - Users can build groups with other users for chatting, just through their usernames.
2. **Interact with Group Memebers** - Interact with everyone in the group in real-time through messaging.
3. **Start a Meeting** - Start a video call with everyone in the group chat with just one click.
4. **Continue Chats of Meeting** - The chats of the video calling of a group gets saved in the Group Chats, therefore providing users to continue with the chat of video calling and also keep track of all information passed in the video calling.

## How to use

* **Login**
1. Go to the home page, and redirect to the Login page.
2. Make an account in the sign up section, if there isn't an account (The user won't be redirected if the account with same username already exists).

    <img src="https://github.com/unnati1201/LivMeet/blob/main/images/signin.png" width="500" />

3. In case of having an account, then sign-in through the sign-in section on the same page.

    <img src="https://github.com/unnati1201/LivMeet/blob/main/images/signup.png" width="500" />

4. Once logged in, the home page will load up, and the user will be able to use the chat window and enter/host a meeting.

* **Start a meeting / Join a meeting**
1. On home page, click on *Schedule a Meeting* to start a new meeting. (The user needs to be logged in for this).
2. If there is a meeting ID, enter the ID in the input box, and click *Join*. The user will be able to enter the meeting.

    <img src="https://github.com/unnati1201/LivMeet/blob/main/images/home.png" width="500" />


* **Functionalities in the Meeting**
1. Right at the beginning, the user will be asked by a prompt to enter the username. ( Make sure to enter correct username )
2. At the bottom of the screen, there will be several buttons (for eg. Mute/Unmute Button, Camera On/Off button, 'Raise your hand' button).
3. On hovering over three dotted button, there will be more options visible.
    1. **Share Screen** - On clicking over *Share Screen*, the user will be able to select a screen and share it with other participants.
    2. **Participants** - On clicking over *Partipants*, the user will be able to see a list of all participants currently present in the meeting.
    3. **Chat** - Through this option, a chat box will open up, which will allow the user to message other users over the chat window, or use emojis.
    4. **Share Link** - This option lets the user copy the meeting ID, which can be shared manually. Also, the meeting link can be shared with others through e-mail.
    5. **Breakout Rooms** - On clicking *Breakout Rooms* option, a list of all other participants appears. User can select the appropriate room for each participant and click *Assign*. This will send an alert to all the participants. On accepting the alert, participants get directed to the room assigned to them. The organiser of the breakout room can send annoucements to all the rooms, using *Make Annoucement* button. The organiser has the option to end the breakout rooms and bring the participants back to the main meeting, using *Close Rooms* button. This button sends the partipants an alert to join back to main meeting. On sccepting the alert, participants get redirected to the main meeting.    

    <img src="https://github.com/unnati1201/LivMeet/blob/main/images/videoFunctions.png" width="500" />

* **Functionalities in the Group Chat**
1. On clicking *Chat* on Home Page, the users will be redirected to their Chat Room.
2. The user will be able to view all groups they are a part of, on the left side of the window. If the user just signed up, there won't be any chat groups.
3. **Create a Group** - To make a group, click on **+** button. A box will appear. Enter and add all usernames of the users in the box, one at a time, by pressing *Add*. Once all the users are added, give a name to the group and click *Done*. This will create a group with all the users you have added. The name of the group will appear on the left side of chat window. You may now click on the group name on left and interact with all the members of the group.  
4. **Start a Group Meeting** - To start a group meeting, select the group name on the left side of the chat window, and click on the 'Camera' button. This will redirect the user to a new meeting, which can be joined by all other participants of the same chat group.
5. **Continue your chat** - To continue chats after a meeting, just go to the chat window and click on the appropriate chat group. All previous chats of the meeting will be saved there.

    <img src="https://github.com/unnati1201/LivMeet/blob/main/images/chatRoom.png" width="500" />

## Technologies Used

* **For Front-end web Develeopment:**
1. EJS
2. CSS
3. Javascript

* **For Back-end web Develeopment:**
1. Node.js
2. Express.js

* **For Databases:**
1. MongoDB Atlas
2. Mongoose

* **Cloud Computing Platform:**
1. Microsoft Azure

* **Others**
1. Socket.io (for real-time communication)
2. Peerjs Library (for peer to peer connection in video calling)
