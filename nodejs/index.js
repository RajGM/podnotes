const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello from Node.js server!');
});

app.listen(port, () => {
  console.log(`Node.js server listening at http://localhost:${port}`);
});

const socket = new WebSocket(`ws://localhost:${port}`)

socket.onopen = () => {
	console.log({ event: 'onopen' })
	mediaRecorder.addEventListener('dataavailable', async (event) => {
		if (event.data.size > 0 && socket.readyState === 1) {
			socket.send(event.data)
		}
	})
	mediaRecorder.start(1000)
}

socket.onmessage = (message) => {
	const received = JSON.parse(message.data)
	const transcript = received.channel.alternatives[0].transcript
	if (transcript) {
		console.log(transcript)
		setAffirmation(transcript)
	}
}

socket.onclose = () => {
	console.log({ event: 'onclose' })
}

socket.onerror = (error) => {
	console.log({ event: 'onerror', error })
}

socketRef.current = socket