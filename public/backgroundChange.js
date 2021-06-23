// const videoElement = document.querySelector('.local-video');
// const canvas = document.querySelector('canvas');
// const blurBtn = document.querySelector('.blurScreen');
//
// const ctx = canvas.getContext('2d');
//
// blurBtn.addEventListener('click', e => {
//   blurBtn.hidden = true;
//
//   //videoElement.hidden = true;
//   canvas.hidden = false;
//
//   loadBodyPix();
// });
//
// function loadBodyPix() {
//   options = {
//     multiplier: 0.75,
//     stride: 32,
//     quantBytes: 4
//   }
//   bodyPix.load(options)
//     .then(net => perform(net))
//     .catch(err => console.log(err))
// }
//
// async function perform(net) {
//
//   while (blurBtn.hidden) {
//     const segmentation = await net.segmentPerson(video);
//
//     const backgroundBlurAmount = 6;
//     const edgeBlurAmount = 2;
//     const flipHorizontal = true;
//
//     bodyPix.drawBokehEffect(
//       canvas, videoElement, segmentation, backgroundBlurAmount,
//       edgeBlurAmount, flipHorizontal);
//   }
// }







































var video, out_c, out_ctx, temp_c, temp_ctx, model;

const bodyPixConfig = {
  architechture: 'MobileNetV1',
  mobileNetMultiplier: 1,
  outputStride: 16,
  multiplier: 1,
  quantBytes: 4
};

const segmentationConfig = {
  internalResolution: 'high',
  segmentationThreshold: 0.05,
  scoreThreshold: 0.05
};

const displayCanvas = () => {
  video = document.querySelector(".local-video");

  out_c = document.querySelector("#output-canvas");
  out_c.hidden = false;
  out_ctx = out_c.getContext("2d");

  temp_c = document.createElement("canvas");
  temp_c.setAttribute("width",video.videoWidth);
  temp_c.setAttribute("height",video.videoHeight);
  temp_ctx = temp_c.getContext("2d");
console.log("uhsdj");
  video.play();
  computeFrame();
}

function computeFrame() {
  temp_ctx.drawImage(video,0,0,video.videoWidth,video.videoHeight);
  let frame = temp_ctx.getImageData(0,0,video.videoWidth,video.videoHeight);
  model.segmentPerson(temp_c,segmentationConfig).then((segmentation) => {
    let out_image = out_ctx.getImageData(0,0,video.videoWidth,video.videoHeight);
    for(let x=0;x<video.videoWidth;x++){
      for(y=0;y<video.videoHeight;y++) {
        let n = x + (y * video.videoWidth);
        if(segmentation.data[n] != 0) {
          out_image.data[n * 4] = frame.data[n * 4]; //R
          out_image.data[n * 4 + 1] = frame.data[n * 4 + 1]; //G
          out_image.data[n * 4 + 2] = frame.data[n * 4 + 2]; //B
          out_image.data[n * 4 + 3] = frame.data[n * 4 + 3]; //A
        }
      }
    }
    out_ctx.putImageData(out_image,0,0);
    setTimeout(computeFrame,0);
  });
}

// document.querySelector(".blurScreen").onclick = () => {
//   bodyPix.load(bodyPixConfig).then((m) => {
//     model = m;
//     displayCanvas();
//   });
// }
