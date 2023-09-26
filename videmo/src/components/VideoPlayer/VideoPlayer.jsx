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
    const [playedTime, setPlayedTime] = useState(0); 
    const isSeekingToStartTime = useRef(false);
    const [videoRef] = useState(React.createRef());
    // Set the video url to "/" to avoid display the video player before the video is ready
    const [videoUrl, setVideoUrl] = useState("/"); 

    useEffect(() => {
        if (!episode.stream) {
            setVideoUrl(episode.link);
        }
    }, [episode]);

    useEffect(() => {
        if (!episode.stream) return;

        const socket = io('http://localhost:4000'); // TODO - Move to config file

        const videoUrl = episode.stream.stream_url;
        const referer = episode.stream.referer;

        socket.on('connect', () => {
            console.log('Connected to Electron backend');
        });

        // Send a request to Electron to fetch and stream the video
        socket.emit('fetch-video', { videoUrl, referer });

        socket.on('video-stream', (response) => {
            if (videoRef.current) setVideoUrl(response.url);
        });

        socket.on('video-end', () => {
            console.log('Video streaming ended');
        });

        // Clean up when the component unmounts
        return () => {
            socket.disconnect();
        };
    }, [videoRef, episode]);

    useEffect(() => {
        return () => {
            // Reset the flag when the component is unmounted to allow seeking to startTime on next mount
            isSeekingToStartTime.current = false;
        };
    }, []);

    const handlePlayerReady = () => {
        if (startTime && !isSeekingToStartTime.current) {
            videoRef.current.seekTo(startTime);
            isSeekingToStartTime.current = true; // Set the flag to true to avoid seeking again
        }
    };

    const handleSkipForward = () => {
        // Skip forward 1 minute and 30 seconds (90 seconds)
        const newTime = Math.min(videoRef.current.getDuration(), playedTime + 90);
        videoRef.current.seekTo(newTime);
    };

    return (
        <div className={styles.videoPlayer}>
            <div
                className={styles.videoWrapper}
                onMouseEnter={() => setIsPlayerHovered(true)}
                onMouseLeave={() => setIsPlayerHovered(false)}
            >
                <ReactPlayer
                    ref={videoRef} // Set the ref to the playerRef
                    url={videoUrl}
                    controls
                    width="100%"
                    height="auto"
                    playing
                    pip
                    onProgress={(progress) => setPlayedTime(progress.playedSeconds)} // Update the local state with the current played time while the player is open
                    onEnded={() => onCloseVideoPlayer(playedTime, true)} // Update the played time in the database when the video is finished
                    onReady={handlePlayerReady} // Set the start time to the episode played time
                />

                {isPlayerHovered && (
                    <>
                        <div className={styles.videoPlayer__closeContainer}>
                            <div className={styles.videoPlayer__close} onClick={() => onCloseVideoPlayer(playedTime)}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div className={styles.videoPlayer__skipButton} onClick={handleSkipForward}>
                            Passer <KeyboardDoubleArrowRightIcon className={styles.videoPlayer__skipButtonIcon} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;