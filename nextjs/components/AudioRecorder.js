// components/AudioRecorder.js
"use client"

import { useState, useRef, useEffect  } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = 'audio-recordings';

const AudioRecorder = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);

    // State to track whether recording is currently in progress
    const [recording, setRecording] = useState(false);
  
    // Ref to store audio chunks during recording
    const chunks = useRef([]);
  
    // Function to start the recording
    const startRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.start();
        setRecording(true);
      }
    };
  
    // Function to stop the recording
    const stopRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop(); 
        setRecording(false);
      }
    };
  
    // Function to initialize the media recorder with the provided stream
    const initialMediaRecorder = (stream) => {
      const mediaRecorder = new MediaRecorder(stream);
  
      // Event handler when recording starts
      mediaRecorder.onstart = () => {
        chunks.current = []; // Resetting chunks array
      };
  
      // Event handler when data becomes available during recording
      mediaRecorder.ondataavailable = (ev) => {
        chunks.current.push(ev.data); // Storing data chunks
      };
  
      // Event handler when recording stops
      mediaRecorder.onstop = () => {
        // Creating a blob from accumulated audio chunks with WAV format
        const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
        console.log(audioBlob, 'audioBlob')
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(audioUrl);

        // Play the recorded audio
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
        // You can do something with the audioBlob, like sending it to a server or processing it further
      };
  
      setMediaRecorder(mediaRecorder);
    };
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(initialMediaRecorder);
      }
    }, []); 

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop
      </button>
    </div>
  );
};

export default AudioRecorder;
