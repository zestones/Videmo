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
    const videoUrl = req.query.url;
    const referer = req.query.referer;
    const rangeHeader = req.headers.range;

    try {
        const headers = {
            Referer: referer,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            Accept: 'video/mp4',
        };

        if (rangeHeader) {
            headers.Range = rangeHeader;
        }

        const response = await axios.get(videoUrl, {
            responseType: 'stream',
            headers: headers,
        });

        res.writeHead(response.status, {
            ...response.headers,
            'Access-Control-Allow-Origin': '*',
        });

        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error streaming video');
    }
});

// Handle incoming socket connections
io.on('connection', (socket) => {

    socket.on('get-images', async ({ animes, referer }) => {
        for (let anime of animes) {
            if (anime.image.startsWith('data:')) {
                socket.emit('image-update', { anime });
                continue;
            }

            try {
                // Effectuez la requête HTTP vers le serveur distant avec l'en-tête Referer
                const response = await axios.get(anime.image, {
                    headers: { Referer: referer },
                    responseType: 'arraybuffer',
                });
                anime.image = `data:image/jpeg;base64, ${Buffer.from(response.data, 'binary').toString('base64')}`;
            } catch (error) {
                console.error('Error fetching image:', error);
                anime.image = null;
            }

            socket.emit('image-update', { anime });
        }
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});


module.exports = { server };