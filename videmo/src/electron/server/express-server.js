// electron-backend.js

const express = require('express');
const http = require('http');
const axios = require('axios');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors'); // Import the cors middleware

const app = express();
const server = http.createServer(app);


const io = socketIO(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your React app's URL
        methods: ["GET", "POST"],
        credentials: true // Allow credentials (cookies, etc.) to be sent cross-origin
    }
});

// Use cors middleware to allow WebSocket connections from your React app
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials (cookies, etc.) to be sent cross-origin
}));


// Serve your React frontend (assuming it's built and in the 'build' directory)
app.use(express.static(path.join(__dirname, 'build')));


// Handle incoming socket connections
io.on('connection', (socket) => {
    socket.on('fetch-video', async ({ videoUrl, referer }) => {
        try {
            // Fetch the video from the external source
            const response = await axios.get(videoUrl, {
                headers: {
                    'Referer': referer,
                    'Host': 'video.sibnet.ru',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                },
                responseType: 'stream',
            });

            console.log('Sending video stream to client');
            console.log('response.data.Url: ', response.data.responseUrl)

            // Send the response url to the client
            socket.emit('video-stream', { url: response.data.responseUrl });

        } catch (error) {
            console.error('Error fetching video:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

module.exports = { server };