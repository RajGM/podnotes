"use client"

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const bucketName = 'audio-recordings';

const AudioRecorder = () => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [timerId, setTimerId] = useState(null);

    const chunks = useRef([]);
    const isFinalChunk = useRef(false); // Ref to track if it's the final chunk

    const startRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.start(5000);
            setRecording(true);
        }
    };

    const stopRecording = async () => {
        if (mediaRecorder) {
            clearInterval(timerId);
            isFinalChunk.current = true; // Mark as final chunk
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    const uploadChunks = async () => {
        if (chunks.current.length === 0) {
            return; // No chunks to upload
        }

        const audioBlob = new Blob(chunks.current, { type: "audio/webm;codecs=opus" });
        chunks.current = []; // Clear current chunks after creating the blob

        const filePath = `recording-${Date.now()}.webm`;
        console.log('Uploading to:', filePath); // Debugging log
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, audioBlob, {
            contentType: 'audio/webm',
        });

        if (error) {
            console.error('Error uploading audio:', error);
        } else {
            console.log('Audio uploaded successfully:', data);
        }
    };

    const initialMediaRecorder = (stream) => {
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.onstart = () => {
            chunks.current = [];
            console.log("MediaRecorder started, chunks reset");
        };

        mediaRecorder.ondataavailable = async (ev) => {
            if (ev.data.size > 0) {
                chunks.current.push(ev.data);
                console.log("Data available, chunk added:", ev.data);
                
                // If it's the final chunk, upload immediately
                if (isFinalChunk.current) {
                    await uploadChunks();
                    isFinalChunk.current = false;
                }
            }
        };

        mediaRecorder.onstop = async () => {
            console.log("MediaRecorder stopped");
            // Upload the final chunk when recording stops
            await uploadChunks();
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
