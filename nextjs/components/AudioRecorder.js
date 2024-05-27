// components/AudioRecorder.js
"use client"

import { useState, useRef, useEffect  } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = 'audio-recordings';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioRef = useRef(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
  }, []);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => {
            const updatedChunks = [...prevChunks, event.data];
            console.log('Updated audio chunks:', updatedChunks);
            return updatedChunks;
          });
        }
        console.log('ondataavailable event:', event.data);
      };

      setMediaRecorder(recorder);
      
      recorder.start();
      setRecording(true);
      setPaused(false);
      console.log('Recording started');
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };
  

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      
      const stopHandler = new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          resolve();
        };
      });

      //await stopHandler;

      console.log("Recording stopped, audioChunks:", audioChunks);

      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log(audioUrl);

        // Play the recorded audio
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setAudioChunks([]);
          setRecording(false);
          setPaused(false);
        };

        // Uncomment the following code to upload the audio and store session info
        // const filePath = `${sessionId}/recording-${Date.now()}.webm`;

        // const { data, error } = await supabase.storage.from(bucketName).upload(filePath, audioBlob, {
        //   contentType: 'audio/webm',
        // });

        // if (error) {
        //   console.error('Error uploading audio:', error);
        // } else {
        //   console.log('Audio uploaded successfully:', data);

        //   // Store session information in the database
        //   const response = await fetch('/api/storeSession', {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ userId, sessionId }),
        //   });

        //   if (response.ok) {
        //     console.log('Session information stored successfully');
        //   } else {
        //     console.error('Failed to store session information');
        //   }
        // }
      } else {
        console.log('No audio chunks to record');
      }
    }
}

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        Start
      </button>
      <button onClick={pauseRecording} disabled={!recording || paused}>
        Pause
      </button>
      <button onClick={resumeRecording} disabled={!paused}>
        Resume
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop
      </button>
    </div>
  );
};

export default AudioRecorder;
