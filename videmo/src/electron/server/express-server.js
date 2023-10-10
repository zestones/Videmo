const socketIO = require('socket.io');
const express = require('express');
const axios = require('axios');
const http = require('http');
const path = require('path');
const cors = require('cors');

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

app.get('/stream-video', async (req, res) => {
    const videoUrl = req.query.videoUrl; // Get the video URL from the query parameters
    const referer = req.query.referer;   // Get the referer from the query parameters

    console.log('videoUrl', videoUrl);
    try {
        // Send the request to the external video source
        const response = await axios.get(videoUrl, {
            responseType: 'stream', // Use stream as the response type
            headers: {
                Referer: referer,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            },
        });

        // Set the appropriate response headers
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'inline; filename=video.mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);

        // Stream the video content to the response
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error streaming the video');
    }
});

// Handle incoming socket connections
io.on('connection', (socket) => {

    socket.on('get-images', async ({ animes, referer }) => {
        console.log('get-images');
        for (let anime of animes) {
            if (anime.image.startsWith('data:')) continue; // Si l'image est déjà en base64, passez à l'élément suivant

            try {
                // Effectuez la requête HTTP vers le serveur distant avec l'en-tête Referer
                const response = await axios.get(anime.image, {
                    headers: { Referer: referer },
                    responseType: 'arraybuffer', // Utilisez responseType 'arraybuffer' pour obtenir les données binaires de l'image
                });
                anime.image = `data:image/jpeg;base64, ${Buffer.from(response.data, 'binary').toString('base64')}`;
            } catch (error) {
                console.error('Error on anime image:', anime);
                console.error('Error fetching image:', error);
            }

        }

        socket.emit('images', { animes });
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});

module.exports = { server };