const socket = io('/');
const videoGrid = document.getElementById("video-grid");

const peer = new Peer(undefined, {
  host: "warm-shelf-32519.herokuapp.com",
  secure: true,
  port: 443,
  debug: 1
});

const myVideo = document.createElement("video");
myVideo.muted = true;
let thisVideo;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {
  thisVideo = stream;
  addVideo(myVideo, stream);

  peer.on('call', function(call) {
      call.answer(stream);
      const video = document.createElement("video");
      call.on('stream', function(remoteStream) {
        addVideo(video, remoteStream);
      });
  });

  socket.on('user-connected', userId => {
    setTimeout(() => {
      connectToNewUser(userId, stream)
    }, 1000)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on("open",(userId)=>{
  socket.emit("join-room",id,userId);
})

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on('stream', function(remoteStream) {
    addVideo(video, remoteStream);
  });
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

const addVideo = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", ()=>{
    video.play();
  })
  videoGrid.append(video);
}

document.querySelector(".muteBtn").onclick = function(evt) {
  const tracks = thisVideo.getAudioTracks()
  if(tracks[0].enabled == true){
    tracks[0].enabled = false;
  }else{
    tracks[0].enabled = true;
  }
}

document.querySelector(".closeCam").onclick = function(evt) {
  const tracks = thisVideo.getVideoTracks()
  if(tracks[0].enabled == true){
    console.log("hgjhgbkj")
    tracks[0].enabled = false;
  }else{
    console.log("hgkj")
    tracks[0].enabled = true;
  }
}
