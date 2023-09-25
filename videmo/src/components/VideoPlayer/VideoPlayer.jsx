import React, { useEffect, useState, useRef } from "react";

// External
import CloseIcon from '@mui/icons-material/Close';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import ReactPlayer from 'react-player'

// Styles
import styles from "./VideoPlayer.module.scss";

import io from 'socket.io-client';

function VideoPlayer({ episode, startTime, onCloseVideoPlayer }) {
    // State initialization
    const [isPlayerHovered, setIsPlayerHovered] = useState(false);
    const [playedTime, setPlayedTime] = useState(0); // Local state to store the played time

    const [videoUrl, setVideoUrl] = useState('');
    const [videoRef] = useState(React.createRef());


    useEffect(() => {
        const socket = io('http://localhost:4000'); // Replace with your Electron server URL

        const videoUrl = episode.stream.stream_url; 
        const referer = episode.stream.referer;

        socket.on('connect', () => {
            console.log('Connected to Electron backend');
        });

        // Send a request to Electron to fetch and stream the video
        socket.emit('fetch-video', { videoUrl, referer });

        socket.on('video-stream', (response) => {
            // Append video data to the video element
            if (videoRef.current) {
                console.log('Video streaming started', response);
                videoRef.current.src = response.url;
            }
        });

        socket.on('video-end', () => {
            // Video streaming has ended
            console.log('Video streaming ended');
        });

        // Clean up when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, [videoRef, episode]);


    return (
        <div className={styles.videoPlayer}>
            <div
                className={styles.videoWrapper}
                onMouseEnter={() => setIsPlayerHovered(true)}
                onMouseLeave={() => setIsPlayerHovered(false)}
            >
                <div className="App">
                    {console.log("render : ", videoUrl.url)}
                    <video
                        ref={videoRef}
                        width="100%"
                        height="auto"
                        controls
                        autoPlay />
                </div>

                {isPlayerHovered && (
                    <div className={styles.videoPlayer__closeContainer}>
                        <div className={styles.videoPlayer__close} onClick={() => onCloseVideoPlayer(playedTime)}>
                            <CloseIcon />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;