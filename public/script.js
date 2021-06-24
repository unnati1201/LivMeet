const socket = io('/');
const videoGrid = document.getElementById("video-grid");

const peer = new Peer(undefined, {
  host: "mtclone.herokuapp.com",
  secure: true,
  port: 443,
  key: 'peerjs',
  debug: 1
});

const myVideo = document.createElement("video");
myVideo.muted = true;
let myStream;
const peers = {}
var currentPeer;
var userList;
const name = prompt("Enter your name");;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  myStream = stream;
  myVideo.className = "local-video";
  addVideo(myVideo, stream);

  peer.on('call', function(call) {
    console.log(call);
      call.answer(stream);
      const video = document.createElement("video");
      const input = document.createElement("h1");
      input.innerHTML = call.peer;
      video.append(input);
      call.on('stream', function(remoteStream) {
        addVideo(video, remoteStream);
        currentPeer = call.peerConnection;
      });
  });

  socket.emit('new-user', name)

  socket.on('participants', users => {
    userList = users;
    addParticipants(users);
  })

  socket.on('user-connected', userId => {
    setTimeout(() => {
      connectToNewUser(userId, stream)
    }, 1000)
  })

})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

socket.on('redirect', function(destination) {
    window.location.href = destination;
});

peer.on("open",(userId)=>{
  socket.emit("join-room",id,userId);
})

function connectToNewUser(userId, stream) {
    console.log("called1");
    const call = peer.call(userId, stream);

      const video = document.createElement("video");
        const input = document.createElement("h1");
        input.innerHTML = userId;
        video.append(input);
      call.on('stream', function(remoteStream) {
        addVideo(video, remoteStream, peer.id);
        currentPeer = call.peerConnection;
      });

      call.on('close', () => {
        video.remove()
      })

      peers[userId] = call

}

// add video
const addVideo = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", ()=>{
    video.play();
  })
  if(video.classList.contains("local-video")){
      document.querySelector("#other-video").append(video);
  }
  else{
    videoGrid.append(video);
    adjustVideo(video);
  }
}

// adjust videos
const adjustVideo = (video) => {
  video.className = "remote-video";
  var numOfVideo = document.querySelectorAll('.remote-video').length;
  if(numOfVideo <= 1){
    videoGrid.className = "one-video";
  }
  else if(numOfVideo <= 2){
    videoGrid.classList.remove("one-video");
    for(i=0; i<numOfVideo; i++){
        document.getElementsByClassName("remote-video")[i].className = "remote-video col-6";
    }
  }else if(numOfVideo <= 6){
    for(i=0; i<numOfVideo; i++){
        document.getElementsByClassName("remote-video")[i].className = "remote-video col-4";
    }
  }else if(numOfVideo <= 8){
    for(i=0; i<numOfVideo; i++){
        document.getElementsByClassName("remote-video")[i].className = "remote-video col-3";
    }
  }
}

//remove video
const removeVideo = (video, stream) => {
  video.remove();
}

// mute button functionality
document.querySelector(".muteBtn").onclick = () => {
  const tracks = myStream.getAudioTracks();
  var mic = document.querySelector(".muteBtn");
  if(tracks[0].enabled == true){
    tracks[0].enabled = false;
    document.querySelector(".micIcon").innerHTML = "mic_off";
    mic.style.backgroundColor = "#DA0037";
    mic.style.color = "#fff";
  }else{
    tracks[0].enabled = true;
    document.querySelector(".micIcon").innerHTML = "mic";
    mic.style.backgroundColor = "#fff";
    mic.style.color = "#000";
  }
}

// camera button functionality
document.querySelector(".closeCam").onclick = () => {
  const tracks = myStream.getVideoTracks()
  var cam = document.querySelector(".closeCam");
  if(tracks[0].enabled == true){
    tracks[0].enabled = false;
    document.querySelector(".videoBtn").innerHTML = "videocam_off";
    cam.style.backgroundColor = "#DA0037";
    cam.style.color = "#fff";
  }else{
    tracks[0].enabled = true;
    document.querySelector(".videoBtn").innerHTML = "videocam";
    cam.style.backgroundColor = "#fff";
    cam.style.color = "#000";
  }
}

// end button functionality
document.querySelector(".end").onclick = () => {
  removeVideo(myVideo,myStream);
  adjustVideo(myVideo);
  socket.disconnect();
}

//raiseHand
socket.on("person-raised-hand", userId => {
  var videos = document.querySelectorAll('#video-grid video');
  for(var i=0; i<videos.length; i++) {
    const x = videos[i].querySelector("h1").innerHTML;
    console.log(x);
    if(x == userId){
      videos[i].style.border = "2px solid yellow"
    }
  }
})

socket.on("person-down-hand", userId => {
  var videos = document.querySelectorAll('#video-grid video');
  for(var i=0; i<videos.length; i++) {
    const x = videos[i].querySelector("h1").innerHTML;
    console.log(x);
    if(x == userId){
      videos[i].style.border = "none"
    }
  }
})

document.querySelector(".raiseHand").onclick = () => {
  var x = document.querySelector(".raiseHand input");
  if(x.value == "off"){
    socket.emit('hand-raise', peer.id);
     document.querySelector(".raiseHand").style.backgroundColor = "yellow"
    x.value = "on";
  }else{
    x.value = "off"
    socket.emit('hand-down', peer.id);
    document.querySelector(".raiseHand").style.backgroundColor = "#fff"
  }
}

function raisedHand(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on('stream', function(remoteStream) {
      addVideo(video, remoteStream);
      currentPeer = call.peerConnection;
    });
    call.on('close', () => {
      video.remove()
    })

    peers[userId] = call
}

// share button functionality
document.querySelector(".shareBtn").onclick = () => {
  document.querySelector(".invite").style.display = "block";
}

// copy link
document.querySelector(".copyBtn").onclick = () => {
  const cl = document.createElement('textarea');
  cl.value = id;
  cl.setAttribute('readonly', '');
  cl.style.position = 'absolute';
  cl.style.left = '-9999px';
  document.body.appendChild(cl);
  cl.select();
  document.execCommand('copy');
  document.body.removeChild(cl);
}

//share
document.querySelector(".shareEmailBtn").onclick = () => {
  var emailID = document.querySelector("#emailID").value;
  var link = "mailto:" + emailID + "?subject=Meeting Link&body=The link to the site is " + "http://localhost:3000/"+id;
  document.querySelector("#emailShare").href = link;
}

//close share
document.querySelector(".closeShare").onclick = () => {
  document.querySelector(".invite").style.display = "none";
}

//share screen
document.querySelector(".shareScreen").onclick = () => {
  document.querySelector(".screenShare").style.display = "block";
  document.querySelector(".noShare").onclick = () => {
    document.querySelector(".screenShare").style.display = "none";
  }
  document.querySelector(".yesShare").onclick = () => {
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    }).then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        stopScreenShare();
      };

      const sender = currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);

      sender.replaceTrack(videoTrack);
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
    document.querySelector(".screenShare").style.display = "none";
  }
}

const stopScreenShare = () => {
    const videoTrack = myStream.getVideoTracks()[0];
    const sender = currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }

//participantsList

function addParticipants(users){
  const content = document.querySelector(".participants-content");
  while(content.firstChild){
      content.removeChild(content.firstChild);
  }
  for (var i in users) {
    const div = document.createElement("div");
    const user = document.createElement("li");
    user.innerHTML = users[i];
    user.className = "list-group-item";
    div.append(user);
    content.append(div);
  }
}

document.querySelector(".participants").onclick = () => {
  document.querySelector(".participants-element").style.display = "block";
}

document.querySelector(".closeList").onclick = () => {
  document.querySelector(".participants-element").style.display = "none";
}

//chatbox
document.querySelector(".chatBtn").onclick = () => {
  document.querySelector(".message-container").style.display = "block";
}
document.querySelector(".closeChat").onclick = () => {
  document.querySelector(".message-container").style.display = "none";
}

socket.on('chat-message', data => {
  addMessage(`${data.message}`, `${data.name}`);
})

const messageInput = document.querySelector(".message-input");
const chatMessages = document.querySelector(".chat-messages");

document.querySelector(".chat-form").addEventListener("submit", e => {
  e.preventDefault();
  const message = messageInput.value;
  if(message != ''){
    socket.emit("send-chat-message", message)
    messageInput.value = '';
    addMessage(message, "You")
  }
})

function addMessage(message, name) {
  const messageElement = document.createElement("div")
  const nameElement = document.createElement("p");
  nameElement.className = "fw-light";
  nameElement.innerHTML = name;
  const text = document.createElement("h6");
  text.innerHTML = message;
  messageElement.append(name);
  messageElement.append(text);
  chatMessages.append(messageElement);
}
