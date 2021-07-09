const room1 = [];
const room2 = [];
const room3 = [];
const room4 = [];

document.querySelector(".closeBRList").onclick = () => {
  document.querySelector(".breakout-element").style.display = "none";
}

document.querySelector(".boRoomBtn").onclick = () => {
  document.querySelector(".breakout-element").style.display = "block";
}

document.querySelector(".boFinalBtn").onclick = () => {
  var contentEle = document.querySelector('.users-content');
  var ids = contentEle.querySelectorAll('h1')
  var content = contentEle.querySelectorAll('form')

  for(var i=0; i<content.length; i++){
    const n = 'roomNum' + i;
    const choice1 = content[i].querySelector("label:nth-child(1) input");
    const choice2 = content[i].querySelector("label:nth-child(2) input");
    const choice3 = content[i].querySelector("label:nth-child(3) input");
    const choice4 = content[i].querySelector("label:nth-child(4) input");

    if(choice1.checked){
      room1.push(ids[i].innerHTML);
    }else if(choice2.checked){
      room2.push(ids[i].innerHTML);
    }else if(choice3.checked){
      room2.push(ids[i].innerHTML);
    }else if(choice4.checked){
      room2.push(ids[i].innerHTML);
    }
  }

  for(var i=0; i<room1.length; i++){
    var data = {
      id: id + "?room=1",
      userId: room1[i]
    }
    socket.emit("join-breakout-room", (data));
  }

  for(var i=0; i<room2.length; i++){
    var data = {
      id: id + "?room=2",
      userId: room2[i]
    }
    socket.emit("join-breakout-room", (data));
  }

  for(var i=0; i<room3.length; i++){
    var data = {
      id: id + "?room=3",
      userId: room3[i]
    }
    socket.emit("join-breakout-room", (data));
  }

  for(var i=0; i<room4.length; i++){
    var data = {
      id: id + "?room=4",
      userId: room4[i]
    }
    socket.emit("join-breakout-room", (data));
  }
  document.querySelector(".breakout-element").style.display = "none";
  document.querySelector(".desolveBOBtn").style.display = "inline-block";
  document.querySelector(".annoucementBtn").style.display = "inline-block";
}

//destroy breakout room
document.querySelector(".desolveBOBtn").onclick = () => {
  var data = {
    room1: room1,
    room2: room2,
    room3: room3,
    room4: room4,
    id: id
  }
  socket.emit("rejoin-main-room", (data));
  document.querySelector(".desolveBOBtn").style.display = "none";
  document.querySelector(".annoucementBtn").style.display = "none";
}

//make Annoucement
document.querySelector(".annoucementBtn").onclick = () => {
  document.querySelector(".breakout-element").style.display = "none";
  document.querySelector(".annoucement-container").style.display = "block";
  document.querySelector(".aform").addEventListener("submit", e => {
    e.preventDefault();
    var message = document.querySelector(".annoucementInput").value;
    if(message != ""){
      socket.emit("send-message-to-BoRooms", (message));
      document.querySelector(".annoucementInput").value = "";
    }
  })
}

document.querySelector(".closeAnnoucemntBox").onclick = () => {
  document.querySelector(".annoucement-container").style.display = "none";
}

function addUsers(username, users){

  const content = document.querySelector(".users-content");
  while(content.firstChild){
      content.removeChild(content.firstChild);
  }
  var x = 0;
  for (var i in username) {

    if(users[i] === socket.id){
      continue;
    }

    const options = document.createElement("form");

    const choice1 = document.createElement("input");
    const choice2 = document.createElement("input");
    const choice3 = document.createElement("input");
    const choice4 = document.createElement("input");

    choice1.type = "radio";
    choice2.type = "radio";
    choice3.type = "radio";
    choice4.type = "radio";

    choice1.name = "radio" + x;
    choice2.name = "radio" + x;
    choice3.name = "radio" + x;
    choice4.name = "radio" + x;

    choice1.value = "Room 1";
    choice2.value = "Room 2";
    choice3.value = "Room 3";
    choice4.value = "Room 4";

    x++;
    // choice1.checked = "true";

    const label1 = document.createElement("label");
    const label2 = document.createElement("label");
    const label3 = document.createElement("label");
    const label4 = document.createElement("label");
    label1.className = "radio-inline";
    label2.className = "radio-inline";
    label3.className = "radio-inline";
    label4.className = "radio-inline";

    label1.append(choice1);
    label1.append(" Room 1 ");
    label2.append(choice2);
    label2.append(" Room 2 ");
    label3.append(choice3);
    label3.append(" Room 3 ");
    label4.append(choice4);
    label4.append(" Room 4 ");

    options.append(label1);
    options.append(label2);
    options.append(label3);
    options.append(label4);

    const boUnser = document.createElement("div");
    boUnser.style.paddingBottom = "10px";

    const userName = document.createElement("h6");
    userName.innerHTML = username[i];
    const user = document.createElement("h1");
    user.innerHTML = users[i];
    user.style.display = "none";
    // boUnser.className = "list-group-item";

    boUnser.append(userName);
    boUnser.append(user);
    boUnser.append(options);
    content.append(boUnser)
  }
}

socket.on("breakout-room-accept", (id) => {

  var confirmation = window.confirm("Will you like to redirect to breakout room?");
  if(confirmation){
    location.replace("/" + id);
  }
})

socket.on("receive-annoucement", message => {
  addMessage(message, "Organizer");
})

socket.on("rejoin-main-room-accept", (id) => {

  var confirmation = window.confirm("Join back to Main Meeting");
  if(confirmation){
    location.replace("/" + id);
  }
})
