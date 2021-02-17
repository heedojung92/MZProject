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
    //270 480
    document.body.append('loaded')

    imageUpload.addEventListener('change', async () => {

        // 사진을 화면에 표시함
        const image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)

        // canvas를 초기화 한다
        const canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = {width: image.width, height: image.height}
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
