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

app.get('/stream-video', async (req, res) => {
    const { referer, url } = req.query; // Récupérer l'URL de la vidéo et le referer depuis les paramètres de la requête

    // Vérification de la validité du referer et de l'URL (à personnaliser selon vos besoins)
    try {
        // Utiliser Axios pour récupérer la vidéo depuis l'URL fournie
        const response = await axios.get(url, {
            headers:
            {
                Referer: referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
            },
            responseType: 'stream', // Indiquer à Axios de retourner une réponse en streaming
        });

        // Envoyer la vidéo récupérée en tant que réponse à la requête actuelle
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de la vidéo');
    }

});

app.get('/stream-video', async (req, res) => {
    const videoUrl = req.query.videoUrl;
    const referer = req.query.referer;
    const videoTotalLength = req.query.videoTotalLength;

    const range = req.headers.range;

    try {
        const response = await axios.get(videoUrl, {
            responseType: 'stream',
            headers: {
                Referer: referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
                'Range': range,
                'Accept-Ranges': 'bytes',
            },
        });


        let start = 0;
        let end = videoTotalLength - 1;

        const rangeRegex = /bytes=(\d+)-(\d+)?/;
        const rangeResult = range.match(rangeRegex);

        if (rangeResult) {
            start = parseInt(rangeResult[1], 10);
            end = rangeResult[2] ? parseInt(rangeResult[2], 10) : videoTotalLength - 1;
        }

        const chunksize = (end - start) + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${videoTotalLength}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
            'Content-Disposition': 'inline; filename=video.mp4',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': 0
        });

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