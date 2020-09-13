let utils = new Utils('errorMessage'); //use utils class

utils.loadOpenCv(()=>{

    let video = document.getElementById("videoInput");
    
    // take param from the video input
    let height = video.height;
    let width = video.width;
    let streaming = true;

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
    let faces = new cv.RectVector();
    let eyes = new cv.RectVector();

    let eyeClassifier = new cv.CascadeClassifier();  // initialize classifier
    let faceClassifier = new cv.CascadeClassifier();  // initialize classifier

    let eyeCascadeFile = 'haarcascade_eye.xml'; // path to xml
    let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // path to xml
    // use createFileFromUrl to "pre-build" the xml
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
        
        faceClassifier.load(faceCascadeFile); // in the callback, load the cascade from file 
        console.log("cascade loaded face")
    });
    utils.createFileFromUrl(eyeCascadeFile, eyeCascadeFile, () => {
        
        eyeClassifier.load(eyeCascadeFile); // in the callback, load the cascade from file 
        console.log("cascade loaded eye")
    });
    const FPS = 30;
    function processVideo() {
        try {
            if (!streaming) {
                // clean and stop.
                src.delete();
                dst.delete();
                gray.delete();
                faces.delete();
                eyes.delete();
                classifier.delete();
                return;
            }
            let begin = Date.now();
            // start processing.
            cap.read(src);
            //src.resizeTo = cv.Size(width/4, height/4)
            //resizeTo();
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            // detect faces.
            let msize = new cv.Size(0, 0);
            faceClassifier.detectMultiScale(gray, faces, 1.1, 3, 0);
            

            // draw faces.
            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]);

                //detect the eye inside the face box
                let faceBox = gray.roi(new cv.Rect(face.x, face.y, face.width, face.height));
                eyeClassifier.detectMultiScale(faceBox, eyes, 1.1, 3, 0);
                
                for (let i = 0; i < eyes.size(); ++i) {
                    let eye = eyes.get(i);
                    let point1 = new cv.Point(face.x+eye.x, face.y+eye.y);
                    let point2 = new cv.Point(face.x+eye.x + eye.width, face.y+eye.y + eye.height);
                    cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);
                }
            }
            
            cv.imshow('canvasOutput', dst);
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