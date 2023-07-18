import React,{ useEffect, useRef, useState } from "react";
import alertService from "../../../services/alertService";
import './VideoRecord.scss';
// import domtoimage from "dom-to-image";
// import CanvasVideo from "./CanvasVideo";
import APIService from "../../../services/apiService";
import * as Constants from '../../Constants';
import { displayTextWidth, getTokenClient } from "../../../utils/Common";
import ScreenshotComponent from "./ScreenShotSomponent";


let  ctx, startX, startY, endX, endY, offsetX, offsetY, down = false, selectedText = -1;
let undoStack = [], redoStack = [];
let selectMedia;
let backspace = false;
let stream;
let closeInterval = false;
const recordingClass = 'iassist-wrapper-recording';
let removedChildForRecord;
let mediaStreamRecord;
const initialTextBoxWidth = 120;

const VideoRecord = ({ save, close, message }) => {

    const ref = useRef(5);

    const initialLoad = useRef(false);

    const interval = useRef(null);

    const img = useRef();

    const canvas = useRef();

    const [timer, setTimer] = useState(5);

    const [showLoadData, setShowLoadData] = useState(false);

    const [videoUrl, setVideoUrl] = useState('');

    const [videoBlob, setVideoBlob] = useState('');

    const [random, setRandom] = useState("");

    const [empty, setEmpty] = useState(false);

    const [showTextBox, setShowTextBox] = useState(false);

    const [drawArrow, setDrawArrow] = useState(false);

    const drawArrowTest = useRef(false)

    const [getDataURL, setGetDataURL] = useState('');

    const [textBoxValue, setTextBoxValue] = useState('');

    const [isDragging, setIsDragging] = useState(false);

    const [position, setPosition] = useState({ x: 0, y: 0 });

    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [isCapturing, setIsCapturing] = useState(false);

    const [isMinimize, setIsMinimize] = useState(false);

    const [recording, setRecording] = useState(false); 

    const [isPause, setIsPause] = useState(false);

    const [elapsedTime, setElapsedTime] = useState(0);
    
    const [isActionDragging, setIsActionDragging] = useState(false);
    const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
    const [actionOffset, setActionOffset] = useState({ x: 0, y: 0 });

    const [audioStream, setAudioStream] = useState(null);

    const [isMuted, setMuted] = useState(true);

    const intervalRef = useRef(null);

    const videoRef = useRef();
    const mediaStreamRef = useRef(null);

    const [enableCrop, setEnableCrop] = useState(false);

    const [selectedImage, setSelectedImage] = useState('');

    const [inputBoxWidth, setInputBoxWidth] = useState(initialTextBoxWidth);

    const inputRef = useRef(null)



    const startCountDown = () => {


        if (+ref.current === 1) {

            clearInterval(interval.current);

            closeInterval = true;

            interval.current = null;

            // console.log('after', interval.current)


            start();

            setTimer(5)

            ref.current = 5;

            return;
            // time = 5;

        } else {

            // time -=1 ;

            setTimer(timer => timer - 1);

            ref.current = ref.current - 1

        }

    }

    useEffect(() => {

        if (random === '') {

            getMediaId();

        }

        interval.current = setInterval(() => {


            if (!closeInterval) {


                startCountDown();

            } 
            else {

                clearInterval(interval.current);

                closeInterval = true;

            }
        }, 1000);

        document.addEventListener('click', recordStopClick);

        return () => {
            document.removeEventListener('click', recordStopClick);
        }

    }, [])

    const recordStopClick = (e) => {
        const triggerButton = document.getElementById(recordingClass);

        if (triggerButton?.contains(e.target)) {
            e.preventDefault();
            mediaStreamRecord.stop();
        }
    }

    useEffect(() => {
        let video = document.getElementById('iassist-vid-player');

        if (video) {

            video.play();

            video.currentTime = 1000000000;

            video.onended = () => {

                if (!initialLoad.current) {

                    // setShowLoader(false);

                    video.play();

                    video.controls = true;

                    initialLoad.current = true;

                    video.currentTime = 0;

                }

            }

        }
    }, [videoUrl])

    const getMediaId = () => {

        const jwt_token = getTokenClient();

        let token = `Bearer ${jwt_token}`;

        selectMedia = message === "Record" ? false : true;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/file_id/?capture_or_record=${selectMedia}`, null, false, 'GET', null, token)
            .then(response => {

                if (response) {

                    if (selectMedia) {

                        setRandom(response.capture_id);

                    } else {

                        setRandom(response.record_id)

                    }

                }

            })
            .catch(err => {

                // setShowLoader(false);

                alertService.showToast('error', err.msg);

            });
    }

    async function recordScreen() {

        // let a = null;

        // let combine = null;

        try {

            // a = await navigator.mediaDevices.getDisplayMedia({
            //     audio: true,
            //     video: { mediaSource: 'screen' }
            // }).then(async (e) => {
            //     let audio = await navigator.mediaDevices.getUserMedia({
            //         audio: true, video: false
            //     })
            //     //video.srcObject = e;
            //     combine = new MediaStream([...e.getTracks(), ...audio.getTracks()])
            // });
            setIsPause(false);
            const displayMediaStream = await navigator.mediaDevices.getDisplayMedia({
                video:  { mediaSource: 'screen' },
                audio: true,
            });
            const audioMediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true },
                video: false,
            });
            isCapturing && startCaptureVideo();
            // Combine video and audio streams
            const mediaStream = new MediaStream();
            displayMediaStream
                .getVideoTracks()
                .forEach((track) => mediaStream.addTrack(track));
            audioMediaStream
                .getAudioTracks()
                .forEach((track) => mediaStream.addTrack(track));

            const audioTracks = audioMediaStream.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !isMuted;
            });

            // Store the combined stream in state
            setAudioStream(audioMediaStream);
            return mediaStream;


        } catch (err) {

            // removeRecordIconFromBrowser()
            alertService.showToast('error', err.message);

            close(false);

        }

    }

    const removeRecordIconFromBrowser = () => {
        const buttonId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'buttonId');

            let buttonWrapper = document.getElementById(recordingClass);

            buttonWrapper.id = buttonId;
            removedChildForRecord.forEach(child => {
                buttonWrapper.appendChild(child);
            })

    } 

    function createRecorder(stream, mimeType) {


        // the stream data is stored in this array
        let recordedChunks = [];

        const mediaRecorder = new MediaRecorder(stream);

        stream.getVideoTracks()[0].onended = function () {

            mediaRecorder.stop();

        };

        mediaRecorder.ondataavailable = function (e) {

            if (e.data.size > 0) {

                recordedChunks.push(e.data);

            }
        };

        mediaRecorder.onstop = function () {
            saveFile(recordedChunks);

            stream.getTracks() // get all tracks from the MediaStream
                .forEach(track => track.stop()); // stop each of them

            stopCaptureVideo();

            recordedChunks = [];

            setEmpty(false);

            removeRecordIconFromBrowser();

            setRecording(false);

        };

        mediaRecorder.start(20); // For every 200ms the stream data will be stored in a separate chunk.

        setRecording(true);
        startWatchTimer();

        return mediaRecorder;

    }

    const fileToDataURL = (file) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => {

            setGetDataURL(reader.result);

        }

    }

    function saveFile(recordedChunks) {

        const blob = new Blob(recordedChunks, {
            type: 'video/webm',
            name: `video_id_${random}`,
            lastModified: new Date()
        });

        const myFile = new File([blob], `video_id_${random}.webm`, {
            type: blob.type,
        });

        setVideoUrl(URL.createObjectURL(myFile));

        // this is use To edit video
        // setRecordedVidUrl(URL.createObjectURL(myFile))

        setVideoBlob(myFile);

        fileToDataURL(myFile);

        setShowLoadData(true);

    }

    const takeScreenshot = async () => {

        try {

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
            })
            // get correct video track
            setTimeout(async () => {

                const track = stream.getVideoTracks()[0]

                const imageCapture = new ImageCapture(track)

                // take first frame only
                const bitmap = await imageCapture.grabFrame()

                // destory video track to prevent more recording / mem leak
                track.stop()

                const canvass = document.createElement('canvas');
                // this could be a document.createElement('canvas') if you want
                // draw weird image type to canvas so we can get a useful image
                canvass.width = bitmap.width;

                canvass.height = bitmap.height

                const context = canvass.getContext('2d')

                context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height)

                const image = canvass.toDataURL()

                img.current = image;

                setSelectedImage(image);

                setEnableCrop(true);

                setShowLoadData(true);

                setGetDataURL(image)

                setEmpty(false);

                
                // setTimeout(() => {
                //     renderCanvasText('', 0, 0, []);
                // }, 100);

            }, 200);
        } catch (err) {

            alertService.showToast('error', err.message);

            close(false);

        }

    }

    const start = async () => {


        setEmpty(true);

        closeInterval=false;
        if (message === 'Record') {

            

            stream = await recordScreen();

            let mimeType = 'video/webm';

            if (stream) {

                const buttonId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'buttonId');

                let buttonWrapper = document.getElementById(buttonId);

                let check = [...buttonWrapper?.children];
                removedChildForRecord = [...buttonWrapper?.children];
                check.forEach((child) => {
                    buttonWrapper.removeChild(child);
                })
                buttonWrapper.id = recordingClass;

                // mediaRecorder = 
                mediaStreamRecord = createRecorder(stream, mimeType);

                // time = 5;

            } else {

            }
        } else {

            setTimeout(() => {
                takeScreenshot()
            }, 1000)

        }

    }

    const findFirstChild = (stack) => {

        let firstChild;

        for (let i = 0; i < stack.length; i++) {

            if (stack[i].type === 'text') {

                firstChild = stack[i];

                break;

            }

        }

        return firstChild;
    }

    useEffect(() => {
        if (canvas.current) {
            canvas.current.addEventListener('mousedown', onMouseDown)
            canvas.current.addEventListener('mousemove', handleMouseMove)
            canvas.current.addEventListener('mouseup', handleMouseUp)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvas.current])

    const onKeyDown = (e) => {

        e.persist();

        backspace = false;

        // if (e.key === 'Backspace') {

        //     e.stopPropagation();

        //     undoStack.pop();

        //     backspace = true;

        //     let textContent = getTextFromList(undoStack);

        //     renderCanvasText(textContent.texts, 50, 100, textContent.arrow);

        // }

    }

    const onHandleInput = (e) => {

        e.stopPropagation();

        setTextBoxValue(e.target.value);

        const fontFamily = window.getComputedStyle(inputRef.current).fontFamily
        let textWidth = displayTextWidth(e.target.value, fontFamily);
        if (textWidth > 100 && textWidth < 300) {
            setInputBoxWidth(textWidth + 20)
        }
        



    }

    const splitTextIntoMultipleArray = (text) => {
        const chunkSize = 55;
        if (text.length > 60) {
            let chunks = [];
            for (let i = 0; i < text.length; i += chunkSize) {
                let splitText = text.slice(i, i + chunkSize)
              chunks.push(text.slice(i, i + chunkSize));
              let stack = {
                type: 'text',
                text: splitText,
                x: 50,
                y: (undoStack.length === 0 || undoStack[undoStack.length - 1].type !== 'text') ? 100 : undoStack[undoStack.length - 1].y + 40
            }
            undoStack.push(stack);
            }
            

        }
    }

    const handleTextAddOnCanvasTest = (text, backspace) => {

        if (!backspace) {
           let canvasDetail =  ctx.measureText(textBoxValue);
           if (canvasDetail.width > 945) {
            splitTextIntoMultipleArray(textBoxValue)
            console.log(textBoxValue.length)

           } else {
                let stack = {
                    type: 'text',
                    text: textBoxValue,
                    x: 50,
                    y: (undoStack.length === 0 || undoStack[undoStack.length - 1].type !== 'text') ? 100 : undoStack[undoStack.length - 1].y + 40
                }
                undoStack.push(stack);
            }

            

        }

        let textContent = getTextFromList(undoStack);


            renderCanvasText(undoStack, undoStack[0].x, undoStack[0].y, textContent.arrow);

    }

    const renderCanvasText = (text, x, y, arrows) => {

        let div = document.getElementById('edit-image');

        let imgData = new Image();

        if (img.current === undefined) {

            img.current = canvas.current.toDataURL("image/png");

        }

        if (ctx === undefined) {

            canvas.current = document.createElement('canvas');

            ctx = canvas.current.getContext('2d');

            if (div)
                div.appendChild(canvas.current);

        }

        if (ctx) {

            imgData.src = img.current;

            imgData.onload = function () {

                canvas.current.height = 500;

                canvas.current.width = 1000;

                ctx.drawImage(imgData, 0, 0, canvas.current.width, canvas.current.height);


                ctx.font = "30px Arial";

                ctx.fillStyle = "red";

                // ctx.scale(1,1);
         
                 for (let i = 0; i < undoStack.length; i++) {

                    const texts = undoStack[i]

                    if (texts.type  === 'text') ctx.fillText(texts.text, texts.x, texts.y);
                    else toDrawArrow(ctx, texts.sx, texts.sy, texts.ex, texts.ey, 5, 'red')
                }


                if (arrows && arrows.length > 0) {

                    arrows.forEach((arr) => {
                        toDrawArrow(ctx, arr.sx, arr.sy, arr.ex, arr.ey, 5, 'red')
                    })

                }

                if (drawArrow || drawArrowTest.current) {

                    toDrawArrow(ctx, startX, startY, endX, endY, 5, 'red')

                }

                canvas.current.toBlob((blob) => {

                    const myFile = new File([blob], `screenshot_id_${random}.png`, {
                        type: blob.type,
                    });
                    setVideoUrl(URL.createObjectURL(myFile));

                    // setRecordedVidUrl(URL.createObjectURL(myFile))

                    setShowLoadData(true);

                    setGetDataURL(canvas.current.toDataURL("image/png"));

                    setVideoBlob(myFile);

                    setEmpty(false);

                   

                }, 'image/png')
            };
        }
    }

    const getTextFromList = (stack) => {

        let totalText = '';

        let arrow = [];

        stack.forEach((undo) => {
            if (undo.type === 'text') {
                totalText += undo.text;
            } else {
                arrow = [...arrow, undo];
            }
        })

        let arr = {
            texts: totalText,
            arrow: arrow
        }

        return arr;

    }


    const undo = () => {

        setShowTextBox(false);

        let redo = undoStack.pop();

        if (redo) {

            redoStack.push(redo);

        }

        let textContent = getTextFromList(undoStack);

        let firstChild = findFirstChild(undoStack);


        renderCanvasText(textContent.texts, firstChild?.x, firstChild?.y, textContent.arrow);

    }


    const redo = () => {

        setShowTextBox(false);

        let undo = redoStack.pop();

        if (undo) {

            undoStack.push(undo);

        }

        let textContent = getTextFromList(undoStack);

        let firstChild = findFirstChild(undoStack);

        renderCanvasText(textContent.texts, firstChild?.x, firstChild?.y, textContent.arrow);

    }
    const onMouseDown = (event) => {

        let rect = canvas.current.getBoundingClientRect();

        offsetX = rect.left;
        offsetY = rect.top;

        startX = event.clientX - offsetX

        startY = event.clientY - offsetY



        if ((drawArrow || drawArrowTest.current)) {
            down = true;
            return
        }

        for (let i = 0; i < undoStack.length; i++) {

            if (isTextHit(startX, startY, i) || drawArrowTest.current) {

                down = true;
                selectedText = i;

            }
        }

    }

    const isTextHit = (x, y, textIndex) => {

        let text = undoStack[textIndex];

        if (text.type === 'text') {



            let texts = ctx.measureText(undoStack[textIndex].text);

            if (x >= text.x && x <= text.x + texts.width) {

                if (y >= text.y - 30 && y < text.y) {

                    return true;

                }

            }

        } else {
            let width = Math.abs(text.ex - text.sx) ;
            let height = Math.abs(text.ey - text.sy);
            if ((x >= text.sx || x >= text.ex) && ((x <= text.sx + width) || (x <= text.ex + width))) {

                if (((y >= text.sy - height) || (y >= text.ey - height)) && (y < text.sy || y < text.ey)) {

                    return true;

                }

            }
        }

        return false;

    }


    function handleMouseUp(e) {

        e.preventDefault();

        down = false;
        selectedText = -1;

        if (drawArrow || drawArrowTest.current) {

            let stack = {
                type: 'arrow',
                sx: startX,
                sy: startY,
                ex: endX,
                ey: endY
            }

            undoStack.push(stack)

        }
        drawArrowTest.current = false
        setDrawArrow(false);

    }

    // also done dragging
    function handleMouseOut(e) {

        e.preventDefault();

        down = false;

        selectedText = -1;
        drawArrowTest.current = false
        setDrawArrow(false);


    }

    function handleMouseMove(e) {

        if (down) {

            if (!drawArrow && !drawArrowTest.current && undoStack[selectedText].type !== 'arrow') {

                e.preventDefault();

                let mouseX = parseInt(e.clientX - offsetX);

                let mouseY = parseInt(e.clientY - offsetY);

                // Put your mousemove stuff here
                // var dx = mouseX - startX;

                // var dy = mouseY - startY;

                var dx = mouseX - startX;
                var dy = mouseY - startY;
                startX = mouseX;
                startY = mouseY;

                undoStack[selectedText].x += dx;

                undoStack[selectedText].y += dy;

                let totalText = getTextFromList(undoStack);

                renderCanvasText(undoStack, undoStack[0].x, undoStack[0].y, totalText.arrow);

            } else if (undoStack[selectedText]?.type === 'arrow') {

                e.preventDefault();

                let mouseX = parseInt(e.clientX - offsetX);

                let mouseY = parseInt(e.clientY - offsetY);

                // Put your mousemove stuff here
                // let dx = mouseX - startX;

                // let dy = mouseY - startY;

                endX = mouseX;

                endY = mouseY;

                let getX = mouseX -  undoStack[selectedText].ex;
                let getY = mouseY -  undoStack[selectedText].ey;

                undoStack[selectedText].sx += getX;

                undoStack[selectedText].sy += getY;
                undoStack[selectedText].ex += getX;

                undoStack[selectedText].ey += getY;

                let totalText = getTextFromList(undoStack);

                renderCanvasText(undoStack, 0, 0, totalText.arrow);

            } else {

                e.preventDefault();

                let mouseX = parseInt(e.clientX - offsetX);

                let mouseY = parseInt(e.clientY - offsetY);

                // Put your mousemove stuff here
                // var dx = mouseX - startX;

                // var dy = mouseY - startY;

                endX = mouseX;

                endY = mouseY;

                let x = undoStack[selectedText]?.sx;

                let y = undoStack[selectedText]?.sy;

                let totalText = getTextFromList(undoStack);

                renderCanvasText(undoStack, x, y, totalText.arrow);

            }

        }

    }

    function toDrawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
        //variables to be used when creating the arrow
        var headlen = 10;

        var angle = Math.atan2(toy - fromy, tox - fromx);

        ctx.save();

        ctx.strokeStyle = color;

        //starting path of the arrow from the start square to the end square
        //and drawing the stroke
        ctx.beginPath();

        ctx.moveTo(fromx, fromy);

        ctx.lineTo(tox, toy);

        ctx.lineWidth = arrowWidth;

        ctx.stroke();

        //starting a new path from the head of the arrow to one of the sides of
        //the point
        ctx.beginPath();

        ctx.moveTo(tox, toy);

        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7),
            toy - headlen * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then
        //again to the opposite side point
        ctx.lineTo(tox, toy);

        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7),
            toy - headlen * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        ctx.stroke();

        ctx.restore();

    }

    const handleMouseDownForVideo = (event) => {
        // if(!event.target?.id?.includes("actionMove"))  return;
    
        setIsDragging(true);
        setOffset({
          x: event.clientX - position.x,
          y: event.clientY - position.y,
        });
      };
    
      const handleMouseUpForVideo = (event) => {
        setIsDragging(false);
      };
    
      const handleMouseMoveForVideo = (event) => {
        // if(!event.target?.id?.includes("actionMove"))  return;
        if (isDragging) {
          setPosition({
            x: event.clientX - offset.x,
            y: event.clientY - offset.y,
          });
        }
      };

      const handleMinimizeVideo = () => {
        setIsMinimize(!isMinimize);
      };

      const handleCloseVideo = () => {
        stopCaptureVideo();
      };

      const stopCaptureVideo = () => {
        setIsCapturing(false);
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      // Helper function to format the elapsed time
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    };

      // Function to resume capturing the screen
  const handleResumeRecording = () => {
    if (mediaStreamRecord && isPause) {
        mediaStreamRecord.resume();
      setIsPause(false);
      startWatchTimer();
    }
  };

  // Start the stopwatch
  const startWatchTimer = () => {
    intervalRef.current = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);
  };

  // Stop the stopwatch
  const stopWatchTimer = () => {
    clearInterval(intervalRef.current);
  };


  // function to handle mute and unmute
  const toggleMute = () => {
    if (recording) {
      const audioTracks = audioStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setMuted(!isMuted);
  };

  // Functions for dragging screen recording action menu

  const handleMouseDownOptionDot = (event) => {
    setIsActionDragging(true);
    setActionOffset({
      x: event.clientX - actionPosition.x,
      y: event.clientY - actionPosition.y,
    });
  };

  const handleMouseUpOptionDot = (event) => {
    setIsActionDragging(false);
  };

  const handleMouseMoveOptionDot = (event) => {
    if (isActionDragging) {
      setActionPosition({
        x: event.clientX - actionOffset.x,
        y: event.clientY - actionOffset.y,
      });
    }
  };

   // Function to pause capturing the screen
   const handlePauseRecording = () => {
    if (mediaStreamRecord && !isPause) {
        mediaStreamRecord.pause();
      setIsPause(true);
      stopWatchTimer();
    }
  };

    // Screen recording functionality -----------
  // function to start video recording
  const startCaptureVideo = () => {
    // Access the user's camera
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setIsCapturing(true);
        // Save the media stream reference to be used when capturing the video
        mediaStreamRef.current = stream;

        // Assign the stream to the video element
        videoRef.current.srcObject = stream;
      })
      .catch((error) => {
        setIsCapturing(false);
        console.error("Error accessing camera:", error);
      });
  };

  useEffect(() => {
    if (showTextBox && inputRef.current) inputRef.current.focus()
  }, [showTextBox])

    return (
        <>

            {recording && (
                    <>
                        <div className="recording-action-container" 
                        onMouseDown={handleMouseDownOptionDot}
                        onMouseUp={handleMouseUpOptionDot}
                        onMouseMove={handleMouseMoveOptionDot}
                        style={{transform: `translate(${actionPosition.x}px, ${actionPosition.y}px)`}}
                        >
                        <div className="btn-blinking"></div>
                        <div className="time-pause-wrapper">
                            <div className="video-time">{formatTime(elapsedTime)}</div> 
                        { isPause ? <span className="btn-resume" onClick={handleResumeRecording}></span> : <span className="btn-pause" onClick={handlePauseRecording}></span>}
                        </div>
                        { isCapturing ?  <button onClick={stopCaptureVideo} className="btn-show-video"></button> : <button className="btn-hide-video" onClick={startCaptureVideo}></button>}
                        <button className={`${isMuted ? 'btn-unmute' : 'btn-mute'}`} onClick={toggleMute}></button>
                        <button onClick={() => mediaStreamRecord.stop()}>Stop Recording</button>
                        </div>
                    </>
                    )}

                <>
                    <div
                    className={`capture-video-container ${isMinimize ? "minimize-video" : ""}`}
                    onMouseDown={handleMouseDownForVideo}
                    onMouseUp={handleMouseUpForVideo}
                    onMouseMove={handleMouseMoveForVideo}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        display: !isCapturing && "none",
                    }}
                    >
                    <div
                        className="video-action-container"
                        style={{ display: isMinimize && "none" }}
                    >
                        <div className="video-action">
                        <span className="video-action-icon move">
                            <span id="actionMove" className="action-move"></span>
                            {/* <MoveIcon /> */}
                        </span>
                        <span className="video-action-icon minimize" onClick={handleMinimizeVideo}>
                            <span className="action-minimize"></span>
                            {/* <MinimizeIcon /> */}
                        </span>
                        <span className="video-action-icon close" onClick={handleCloseVideo}>
                            <span className="action-close"></span>
                            {/* <CloseIcon /> */}
                        </span>
                        </div>
                        <video ref={videoRef} autoPlay height={150} />
                    </div>
                    <div
                        className="minimize-screen"
                        onClick={() => {
                        setIsMinimize(false);
                        }}
                        style={{ display: !isMinimize && "none" }}
                    >
                        <button className="video-icon"></button>
                        <span className="fullscreen-video">
                        </span>
                    </div>
                    </div>
                </>

            <div id="video-record-wrapper" className={"video-record-wrapper" + (!showLoadData ? ' main-wrap-position' : '') + (empty ? ' empty' : '')}>

                {!showLoadData &&
                    <div className="timer-wrapper">
                        {message === 'Record' && <div className="camere-icon-wrapper">
                            <span
                                className={isCapturing ? "video-icon" : "video-icon-with-cross"}
                                onClick={() => {
                                setIsCapturing(!isCapturing);
                                }}
                            >
                            </span>
                            <span className={isMuted ? 'mute-mic-icon' : 'mic-icon'} onClick={toggleMute}>
                            </span>
                            </div>}

                        <div className="timer-text">Taking Screen{message} in</div>

                        <div className="timer-time">{timer}</div>

                        <div className="timer-button">

                            <button className="capture" onClick={() => {
                                start()
                                clearInterval(interval.current);
                                closeInterval = false;
                                interval.current = null
                            }}>Capture Now</button>

                            <button className="cancel" onClick={() => {
                                close(false);
                                // time = 5;
                                clearInterval(interval.current);
                                closeInterval = false;
                                interval.current = null;
                            }}>Cancel</button>

                        </div>

                    </div>}

                {showLoadData && <div className="load-record-video">

                    <div className="video-load-header">

                        <div className="left-wrapper">

                            <span className="ss-id">ID-{random}</span>
                            <button className="btn-with-icon btn-delete btn-small" onClick={() => {
                                ctx = undefined;
                                close(false)
                            }}>
                                <i></i>
                                <span>Delete</span>
                            </button>

                            <button className="btn-with-icon btn-save btn-small" onClick={(e) => {
                                ctx = undefined;
                                undoStack = [];
                                redoStack = [];
                                save(e, videoBlob, random, message, getDataURL)
                            }}>
                                <i></i>
                                <span>Save File</span>
                            </button>

                        </div>

                        {message === 'Shot' && <div className="actions">

                            {showTextBox && <div className="text-field"><input style={{width: inputBoxWidth}} type={'text'} value={textBoxValue} ref={inputRef} onChange={onHandleInput} onKeyDown={onKeyDown}></input>
                                {textBoxValue.length > 0 && <span className="add-text-canvas" onClick={() => {

                                handleTextAddOnCanvasTest('', false)
                                setTextBoxValue('')
                                }}>Add Text</span>}
                            </div>}
                            <button title="text" className="add-text" style={{ backgroundColor: showTextBox ? 'blue' : '', color: showTextBox ? 'white' : '' }} onClick={() => {
                                setShowTextBox(!showTextBox)
                            }}></button>
                            <button title="draw" className="draw-arrow" style={{ backgroundColor: drawArrow ? 'blue' : '', color: drawArrow ? 'white' : '' }} onClick={() =>{
                            drawArrowTest.current = true
                            setDrawArrow(true)
                            }}></button>
                            {undoStack.length > 0 && <button title="undo" className="undo" onClick={undo}></button>}
                            {redoStack.length > 0 && <button title="redo" className="redo" onClick={redo}></button>}
                        </div>}
                    </div>
                    {message === 'Record' && <video src={videoUrl} controls id="iassist-vid-player"></video>}

                    {message === 'Shot' && enableCrop && <ScreenshotComponent selectedImage={selectedImage} setSelectedImage={setSelectedImage} imageRef={img} renderImage={renderCanvasText} setImageCrop={setEnableCrop}/>}

                    {message === 'Shot' && !enableCrop && <div id="edit-image" className="image-edit" onMouseOut={handleMouseOut}></div>}

                </div>}

            </div>

        </>)
}

export default VideoRecord