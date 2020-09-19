let utils = new Utils('errorMessage'); //use utils class

utils.loadOpenCv(()=>{

    let video = document.getElementById("videoInput");
    
    // take param from the video input
    let height = video.height;
    let width = video.width;
    let streaming = false;

    let windowWidth = 60;
    let windowHeight = 20;
    let windowPoint1 = new cv.Point(width/2-windowWidth/2, height/2-windowHeight/2);
    let windowPoint2 = new cv.Point(width/2+windowWidth/2, height/2+windowHeight/2);


    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
            streaming = true;
        })
        .catch(function(err) {
            console.log("An error occurred! " + err);
            streaming = false;
        });

    let src = new cv.Mat(height, width, cv.CV_8UC4);
    let dst = new cv.Mat(height, width, cv.CV_8UC4);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(video);

    const FPS = 30;
    function processVideo() {
        try {
            if (!streaming) {
                // clean and stop.
                src.delete();
                dst.delete();
                gray.delete();
                return;
            }
            let begin = Date.now();
            // start processing.
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            
            cv.rectangle(dst,windowPoint1,windowPoint2, [0, 255, 0, 255]);

            let windowImage = gray.roi(new cv.Rect(width/2-windowWidth/2, height/2-windowHeight/2, windowWidth, windowHeight))

            cv.imshow('canvasOutput', dst);
            cv.imshow('windowOutput', windowImage);

            let sum = 0;
            let prev = 0;
            windowImage.data.forEach(element => {
                let c = Math.round(element*8/255); 
                prev != c ? sum += c: null;
                prev = c
            });
            console.log(sum)

            // schedule the next one.
            let delay = 1000/FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        } catch (err) {
            console.log(err);
        }
    };

    // schedule the first one.
    setTimeout(processVideo, 1000);
    }
)