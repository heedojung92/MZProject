function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);
  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

const imageUpload = document.getElementById('imageUpload')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('./models')
]).then(start)

function start() {

    // Canvas container 생성
    const container = document.getElementById("imgDiv");
    container.style.position = 'relative'

    imageUpload.addEventListener('change', async () => {
      if (!('url' in window) && ('webkitURL' in window)) {
        window.URL = window.webkitURL;
      }
      var img=new Image();
      var canvas_tmp=document.createElement('canvas');
      canvas_tmp.width=270;
      canvas_tmp.height=480;
      canvas_tmp.backgroundColor = 'rgb(255, 255, 255)';
      img.src=URL.createObjectURL(document.getElementById("imageUpload").files[0]);
      img.onload = function(){
			     canvas_tmp.getContext("2d").clearRect(0, 0, canvas_tmp.width, canvas_tmp.height);
			     canvas_tmp.getContext("2d").drawImage(img, 0, 0, 270, 480);
		  }
      var dataUrl = canvas_tmp.toDataURL("image/jpeg");
      var canvas_blob=dataURItoBlob(dataUrl);


        // 사진을 화면에 표시함
        const image = await faceapi.bufferToImage(canvas_blob)
        //const image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)

        // canvas를 초기화 한다
        const canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = {width: canvas.width, height: canvas.height}
        faceapi.matchDimensions(canvas, displaySize)

        // 사진에서 얼굴을 식별한다.
        const detections = await faceapi.detectAllFaces(image)
                                .withFaceLandmarks()
                                .withFaceDescriptors()

        // 사진에서 얼굴 좌표에 box를 그린다.
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {label: 'Face'})
            drawBox.draw(canvas)
        })
    })
}
