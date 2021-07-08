let socket = io("/chat");
socket.on('send-chat-meeting', message => {
  console.log(message.message);
  if(message.message.username == currentUsername){

    var newMessage = {
      text: message.message.text,
      username: message.message.username,
      received: false,
      roomId: message.message.roomId,
      timestamp: message.message.timestamp
    }
    // console.log("me");
    addMessage(newMessage);
  }else{
    var newMessage = {
      text: message.message.text,
      username: message.message.username,
      received: true,
      roomId: message.message.roomId,
      timestamp: message.message.timestamp
    }
    // console.log("you");
    addMessage(newMessage);
  }
});

//show chats
var h1Id = document.querySelectorAll('#conversation-list .conversation');
h1Id.forEach(function(e) {
  e.addEventListener('click', onClick, false);
})

function onClick(e) {
  var h1 = e.currentTarget.querySelector("h1").innerHTML;
  console.log(h1);

  var y = document.querySelectorAll(".message-box");
  for(var i=0; i<y.length; i++){
    if(y[i].id == h1){
      document.getElementsByClassName(h1)[0].classList.add("active");
      document.getElementById(h1).style.display = "block";
    }else{
      document.getElementsByClassName(y[i].id)[0].classList.remove("active");
      y[i].style.display = "none";
    }
  }
}

//send messages
socket.on('chat-message', data => {
  console.log("bsjd");
  addMessage(data.message);
})

document.querySelector(".chat-form").addEventListener("submit", e => {
  e.preventDefault();
  var messageInput = document.querySelector("#chat-form input");
  const message = messageInput.value;
  var name = document.querySelector("#chat-title #name").innerHTML;

  console.log(message);

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes();
  var dateTime = date+' '+time;
  var room = document.querySelector(".active").querySelector("h1").innerHTML;

  if(message != ''){
    var newMessage = {
      text: message,
      username: name,
      timestamp: dateTime,
      received: false,
      roomId: room,
      userId: userId
    }

    console.log("send-chat-message");
    socket.emit("send-chat-message", newMessage)
    console.log("send-chat-message done");
    messageInput.value = "";
  }
})

function addMessage(newMessage) {

  console.log(newMessage);

  const messageRow = document.createElement("div");
  const messageTitle = document.createElement("div");
  const messageText = document.createElement("div");
  const messageTime = document.createElement("div");

  messageTitle.className = "message-title";
  messageText.className = "message-text";
  messageTime.className = "message-time";

  messageTitle.innerHTML = newMessage.username;
  messageText.innerHTML = newMessage.text;
  messageTime.innerHTML = newMessage.timestamp;

  if(newMessage.received == false){
    messageRow.className = "message-row you-message";
  }else if(newMessage.received == true){
    messageRow.className = "message-row other-message";
  }

  messageRow.append(messageTitle);
  messageRow.append(messageText);
  messageRow.append(messageTime);

  var divs = document.querySelectorAll(".message-box");
  // console.log(divs);

  for(var i=0; i<divs.length; i++){
    if(divs[i].id == newMessage.roomId){
      divs[i].append(messageRow);
    }
  }

}

//--------------------MAKE GROUPS------------------------------------

socket.on("new-group-done", (data) => {
  console.log(data);
  var conversation = document.createElement("div");
  conversation.className = "conversation " + data.data.roomId;

  var h1 = document.createElement("h1");
  h1.innerHTML = data.data.roomId;
  h1.style.display = "none";

  var title =  document.createElement("div");
  title.innerHTML =  data.data.roomName;
  title.className = "title-text";

  conversation.append(h1);
  conversation.append(title);
  document.querySelector("#conversation-list").append(conversation);

  var messageBox = document.createElement("div");
  messageBox.className = "message-box";
  messageBox.id = data.data.roomId;
  document.querySelector("#chat-message-list").append(messageBox);
  document.querySelector(".invite").style.display = "none";

  h1Id = document.querySelectorAll('#conversation-list .conversation');
  console.log(h1Id.length);
  h1Id.forEach(function(e) {
    e.addEventListener('click', onClick, false);
  })
  console.log(h1Id);
})

document.querySelector("#new-message-container a").onclick = () => {
  document.querySelector(".invite").style.display = "block";
}

document.querySelector(".invite span").onclick = () => {
  document.querySelector(".invite").style.display = "none";
}

var newGroupUsers = [];
if(newGroupUsers.length == 0){
  newGroupUsers.push(currentUsername);
}

document.querySelector(".participants").onclick = () => {
  var participantElm = document.querySelector(".invite #username");
  const participant = participantElm.value;
  if(participant != ''){
    console.log(participant);
    newGroupUsers.push(participant);
    document.querySelector(".invite #username").value = '';
  }
}

document.querySelector(".submitGroup").onclick = () => {
  var groupElm = document.querySelector(".invite #groupName");
  const group = groupElm.value;
  if(group != ''){
    console.log(group);
    const data = {
      groupName: group,
      users: newGroupUsers
    }
    socket.emit("make-new-group",data);
    document.querySelector(".invite #username").value = '';
    newGroupUsers = [];
  }
}

// -------------Meeting through chats--------------
document.querySelector("#chat-title #startMeeting").onclick = () => {
  var room = document.querySelector(".active").querySelector("h1").innerHTML;
  location.replace("/" + room);
}
