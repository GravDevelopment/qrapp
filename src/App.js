import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function App() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [cameraOpen, setCameraOpen] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            setCameraOpen(true);

            console.log('Camera started');
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access the camera.');
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                track.stop();
            });

            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraOpen(false);

        console.log('Camera closed');
    };

    // Automatically close the camera when leaving the page
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, []);

    return (
        <>
            <div>
                <img src="logo192.png" alt="Funny" />
            </div>

            <div id="Functions" className="App">

                {/* Download Manual */}
                <a
                    id="Manual"
                    href="https://www.youtube.com/watch?v=Aq5WXmQQooo"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <button type="button">
                        Download Manual
                    </button>
                </a>

                <br />

                {/* Camera Buttons */}
                {!cameraOpen ? (
                    <button
                        id="startCameraBtn"
                        type="button"
                        onClick={startCamera}
                    >
                        Open Camera
                    </button>
                ) : (
                    <button
                        id="closeCameraBtn"
                        type="button"
                        onClick={closeCamera}
                    >
                        Close Camera
                    </button>
                )}

                <br />

                {/* Camera Feed */}
                <video
                    ref={videoRef}
                    id="videoFeed"
                    autoPlay
                    playsInline
                ></video>

                <br />

                {/* Serial Number */}
                <label htmlFor="SerialNumber">
                    Please Provide the Serial Number:
                </label>

                <br />

                <input
                    type="text"
                    id="SerialNumber"
                    name="SerialNumber"
                    placeholder="Enter serial number"
                />

                <br />

                <button type="button">
                    Search
                </button>

            </div>
        </>
    );
}

export default App;