var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = new SpeechRecognition();

var sound = true;

var checkViewport = setInterval(function() {
    btn = document.querySelector(".micIcon");
      if (btn.innerHTML == "mic") {
        speechDetect();
      }else{
        sound = false;
        socket.emit('voice-notDetect', peer.id);
      }
}, 2000);

function speechDetect(){
  if(!sound){
    sound = true;
    socket.emit('voice-notDetect', peer.id);
    return recognition.stop();
  }
  recognition.start();
  recognition.onsoundstart = function(err) {
    socket.emit('voice-detected', peer.id);
    console.log('Some sound is being received');
  }
  recognition.onspeechend = function () {
    sound = false;
    recognition.stop();
    socket.emit('voice-notDetect', peer.id);
  };
}

socket.on("voice-received", userId => {
  var videos = document.querySelectorAll('#video-grid video');
  for(var i=0; i<videos.length; i++) {
    const x = videos[i].querySelector("h1").innerHTML;
    if(x == userId && videos[i].style.borderColor != "yellow"){
      videos[i].style.border = "2px solid #185ADB"
    }
  }
})

socket.on("voice-notReceived", userId => {
  var videos = document.querySelectorAll('#video-grid video');
  for(var i=0; i<videos.length; i++) {
    const x = videos[i].querySelector("h1").innerHTML;
    if(x == userId && videos[i].style.borderColor != "yellow"){
      videos[i].style.border = "none"
    }
  }
})
