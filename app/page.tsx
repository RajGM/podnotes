import Image from "next/image";
import Head from 'next/head';
import AudioRecorder from '../components/AudioRecorder';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Audio Recorder</title>
        <meta name="description" content="Audio recording and upload with Next.js and Supabase" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Audio Recorder</h1>
        <AudioRecorder />
      </main>
    </div>
  );
}
