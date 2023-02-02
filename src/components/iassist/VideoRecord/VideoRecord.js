import React,{ useEffect, useRef, useState } from "react";
import alertService from "../../../services/alertService";
import './VideoRecord.scss';
// import domtoimage from "dom-to-image";
// import CanvasVideo from "./CanvasVideo";
import APIService from "../../../services/apiService";
import * as Constants from '../../Constants';
import { getTokenClient } from "../../../utils/Common";


let  ctx, startX, startY, endX, endY, offsetX, offsetY, down = false;
let undoStack = [], redoStack = [];
let selectMedia;
let backspace = false;
let stream;
let closeInterval = false;

const VideoRecord = ({ save, close, message }) => {

    const ref = useRef(5);
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

    const [getDataURL, setGetDataURL] = useState('');

    const [textBoxValue, setTextBoxValue] = useState('');

    // const [videoText, setVideoText] = useState('');

    // const [recordedVidUrl, setRecordedVidUrl] = useState('');


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

    }, [])

    const getMediaId = () => {

        const jwt_token = getTokenClient();

        let token = `Bearer ${jwt_token}`;

        selectMedia = message === "Record" ? false : true;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `file_id/?capture_or_record=${selectMedia}`, null, false, 'GET', null, token)
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

        let a = null;

        let combine = null;

        try {

            a = await navigator.mediaDevices.getDisplayMedia({
                audio: true,
                video: { mediaSource: 'screen' }
            }).then(async (e) => {
                let audio = await navigator.mediaDevices.getUserMedia({
                    audio: true, video: false
                })
                //video.srcObject = e;
                combine = new MediaStream([...e.getTracks(), ...audio.getTracks()])
            });

        } catch (err) {

            alertService.showToast('error', err.message);

            close(false);

        }

        return combine;

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

            recordedChunks = [];


            setEmpty(false);

        };

        mediaRecorder.start(20); // For every 200ms the stream data will be stored in a separate chunk.


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

                setShowLoadData(true);

                setGetDataURL(image)

                setEmpty(false);

                
                setTimeout(() => {
                    renderCanvasText('', 0, 0, []);
                }, 100);

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

                // mediaRecorder = 
                createRecorder(stream, mimeType);

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

    const onKeyDown = (e) => {

        e.persist();

        backspace = false;

        if (e.key === 'Backspace') {

            e.stopPropagation();

            undoStack.pop();

            backspace = true;

            let textContent = getTextFromList(undoStack);

            renderCanvasText(textContent.texts, 50, 100, textContent.arrow);

        }

    }

    const onHandleInput = (e) => {

        e.stopPropagation();

        setTextBoxValue(e.target.value);

        if (!backspace) {

            // let event = e;

            backspace = false;

            // console.log(e);

            handleTextAddOnCanvas(e, backspace)

        }

    }

    const handleTextAddOnCanvas = (e, backspace) => {

        if (!backspace) {

            let stack = {
                type: 'text',
                text: e.target.value !== '' ? e.target.value[e.target.value.length - 1] : '',
                x: undoStack.length === 0 ? 50 : 50 + 18,
                y: 100
            }

            undoStack.push(stack);

        }

        let textContent = getTextFromList(undoStack);

        renderCanvasText(textContent.texts, 50, 100, textContent.arrow);

        let txt;

        if (e.target.value.length > 1) {

            txt = ctx.measureText(e.target.value[e.target.value.length - 2])

        }

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

                canvas.current.height = 620;

                canvas.current.width = 1240;

                ctx.drawImage(imgData, 0, 0, canvas.current.width, canvas.current.height);


                ctx.font = "30px Arial";

                ctx.fillStyle = "red";

                //ctx.scale(2, 2);
                ctx.fillText(text, x, y);


                if (arrows && arrows.length > 0) {

                    arrows.forEach((arr) => {
                        toDrawArrow(ctx, arr.sx, arr.sy, arr.ex, arr.ey, 5, 'red')
                    })

                }

                if (drawArrow) {

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

        startX = event.clientX - rect.left

        startY = event.clientY - rect.top;

        let totalText = getTextFromList(undoStack);

        if (isTextHit(startX, startY) || drawArrow) {

            down = true;

        }

    }

    const isTextHit = (x, y) => {

        let text = undoStack[0]?.x;

        if (text) {

            let totalText = getTextFromList(undoStack);

            let texts = ctx.measureText(totalText.texts);

            if (x >= 50 && x <= text + texts.width) {

                if (y + 30 >= undoStack[0].y && y + 30 < undoStack[0].y + 20) {

                    return true;

                }

            }

        }

        return false;

    }

    function handleMouseUp(e) {

        e.preventDefault();

        down = false;

        if (drawArrow) {

            let stack = {
                type: 'arrow',
                sx: startX,
                sy: startY,
                ex: endX,
                ey: endY
            }

            undoStack.push(stack)

        }

        setDrawArrow(false);

    }

    // also done dragging
    function handleMouseOut(e) {

        e.preventDefault();

        down = false;

        setDrawArrow(false);


    }

    function handleMouseMove(e) {

        if (down) {

            if (!drawArrow) {

                e.preventDefault();

                let mouseX = parseInt(e.clientX - offsetX);

                let mouseY = parseInt(e.clientY - offsetY);

                // Put your mousemove stuff here
                // var dx = mouseX - startX;

                // var dy = mouseY - startY;

                startX = mouseX;

                startY = mouseY;

                undoStack[0].x = startX;

                undoStack[0].y = startY;

                let totalText = getTextFromList(undoStack);

                renderCanvasText(totalText.texts, startX, startY, totalText.arrow);

            } else {

                e.preventDefault();

                let mouseX = parseInt(e.clientX - offsetX);

                let mouseY = parseInt(e.clientY - offsetY);

                // Put your mousemove stuff here
                // var dx = mouseX - startX;

                // var dy = mouseY - startY;

                endX = mouseX;

                endY = mouseY;

                let x = undoStack[0]?.x;

                let y = undoStack[0]?.y;

                let totalText = getTextFromList(undoStack);

                renderCanvasText(totalText.texts, x, y, totalText.arrow);

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

    return (
        <>

            <div id="video-record-wrapper" className={"video-record-wrapper" + (!showLoadData ? ' main-wrap-position' : '') + (empty ? ' empty' : '')}>

                {!showLoadData &&
                    <div className="timer-wrapper">

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

                            {showTextBox && <div className="text-field"><input type={'text'} value={textBoxValue} onChange={onHandleInput} onKeyDown={onKeyDown}></input></div>}
                            <button title="text" className="add-text" style={{ backgroundColor: showTextBox ? 'blue' : '', color: showTextBox ? 'white' : '' }} onClick={() => setShowTextBox(!showTextBox)}></button>
                            <button title="draw" className="draw-arrow" style={{ backgroundColor: drawArrow ? 'blue' : '', color: drawArrow ? 'white' : '' }} onClick={() => setDrawArrow(!drawArrow)}></button>
                            <button title="undo" className="undo" onClick={undo}></button>
                            <button title="redo" className="redo" onClick={redo}></button>
                        </div>}
                    </div>
                    {message === 'Record' && <video src={videoUrl} controls></video>}

                    {message === 'Shot' && <div id="edit-image" className="image-edit" onMouseDown={onMouseDown} onMouseMove={handleMouseMove} onMouseOut={handleMouseOut} onMouseUp={handleMouseUp}></div>}

                </div>}

            </div>

        </>)
}

export default VideoRecord