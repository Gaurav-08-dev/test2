import React, { useState, useRef, useEffect } from 'react';
import './RecordAudio.scss'
const mimeType = "audio/webm";

let streamData = ''
const AudioRecorder = ({ handleAudioFile, type }) => {

  const [permission, setPermission] = useState(false);

  const mediaRecorder = useRef(null);

  const [recordingStatus, setRecordingStatus] = useState("inactive");

  // const [stream, setStream] = useState(null);


  const [audioChunks, setAudioChunks] = useState([]);

  function generateRandomFilename(extension) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 4; // Adjust the length as desired
    let filename = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      filename += characters.charAt(randomIndex);
    }

    return filename + '.' + extension;
  }

  function convertWebmToWav(webmBlob, callback) {
    const audioContext = new AudioContext();

    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const webmArrayBuffer = event.target.result;

      audioContext.decodeAudioData(webmArrayBuffer, function (audioBuffer) {
        const offlineContext = new OfflineAudioContext({
          numberOfChannels: audioBuffer.numberOfChannels,
          length: audioBuffer.length,
          sampleRate: audioBuffer.sampleRate
        });

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;

        const scriptProcessorNode = offlineContext.createScriptProcessor(4096, audioBuffer.numberOfChannels, audioBuffer.numberOfChannels);
        const wavSamples = [];

        scriptProcessorNode.onaudioprocess = function (event) {
          const inputBuffer = event.inputBuffer;
          const outputBuffer = event.outputBuffer;

          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const inputData = inputBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);

            for (let i = 0; i < inputBuffer.length; i++) {
              outputData[i] = inputData[i];
              wavSamples.push(outputData[i]);
            }
          }
        };

        source.connect(scriptProcessorNode);
        scriptProcessorNode.connect(offlineContext.destination);
        source.start();

        offlineContext.startRendering().then(function (renderedBuffer) {
          const wavBlob = exportWav(renderedBuffer, audioBuffer.sampleRate, wavSamples);

          callback(wavBlob);
        });
      });
    };

    fileReader.onerror = function (event) {
      console.error('Error reading WebM file:', event.target.error);
    };

    fileReader.readAsArrayBuffer(webmBlob);
  }

  function exportWav(audioBuffer, sampleRate, wavSamples) {
    const wavBuffer = createWavBuffer(audioBuffer, sampleRate, wavSamples);
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

    return wavBlob;
  }

  function createWavBuffer(audioBuffer, sampleRate, wavSamples) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;

    const wavView = new DataView(new ArrayBuffer(length * 2 + 44));

    let offset = 0;

    writeString('RIFF');
    wavView.setUint32(offset, 36 + length * 2, true);
    offset += 4;

    writeString('WAVE');
    writeString('fmt ');
    wavView.setUint32(offset, 16, true);
    offset += 4;

    wavView.setUint16(offset, 1, true); // Audio Format (PCM)
    offset += 2;
    wavView.setUint16(offset, numberOfChannels, true); // Number of Channels
    offset += 2;
    wavView.setUint32(offset, sampleRate, true); // Sample Rate
    offset += 4;
    wavView.setUint32(offset, sampleRate * 2 * numberOfChannels, true); // Byte Rate
    offset += 4;
    wavView.setUint16(offset, numberOfChannels * 2, true); // Block Align
    offset += 2;
    wavView.setUint16(offset, 16, true); // Bits per Sample
    offset += 2;

    writeString('data');
    wavView.setUint32(offset, length * 2, true);
    offset += 4;

    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, wavSamples[i * numberOfChannels + channel]));
        const sampleValue = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        wavView.setInt16(offset, sampleValue, true);
        offset += 2;
      }
    }

    return wavView.buffer;

    function writeString(value) {
      for (let i = 0; i < value.length; i++) {
        wavView.setUint8(offset, value.charCodeAt(i));
        offset++;
      }
    }
  }

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      setPermission(true)
    } else {
      // alert("The MediaRecorder API is not supported in your browser.");
    }
  };


  const startRecording = async () => {
    try {
      streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      // setStream(streamData);
      setRecordingStatus("recording");
      const media = new MediaRecorder(streamData, { type: mimeType });

      mediaRecorder.current = media;

      mediaRecorder.current.start();

      let localAudioChunks = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };

      setAudioChunks(localAudioChunks);
    } catch (err) {
      // alert(err.message);
    }

  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      // const audioUrl = URL.createObjectURL(audioBlob);
      convertWebmToWav(audioBlob, function (wavBlob) {
        const audioFileObject = new File([wavBlob], generateRandomFilename('wav'), { type: audioBlob.type })
        handleAudioFile(audioFileObject, type)
        

        
      });
      streamData?.getTracks() // get all tracks from the MediaStream
        .forEach(track => track.stop());

      setAudioChunks([]);

    };
  };


  useEffect(() => {
    getMicrophonePermission()
  }, [])
  return (

    <div className="audio-controls">
      {permission && recordingStatus === "inactive" ? (
        <button title='Start Recording' id='iassist-recording-btn' onClick={startRecording} type="button">
        </button>
      ) : null}
      {recordingStatus === "recording" ? (

        <button title='Stop Recording' id='stop-audio-recording-button' onClick={stopRecording} type="button">

        </button>
      ) : null}
    </div>
  );
};

export default AudioRecorder;

