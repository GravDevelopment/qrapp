import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

function App() {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scannerControlsRef = useRef(null);
    const codeReaderRef = useRef(null);

    const [cameraOpen, setCameraOpen] = useState(false);
    const [serialNumber, setSerialNumber] = useState('');

    // Create the barcode reader once when the component mounts
    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
    }, []);

    const stopScanning = () => {
        if (scannerControlsRef.current) {
            scannerControlsRef.current.stop();
            scannerControlsRef.current = null;
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // prefer the rear camera on phones/tablets
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            setCameraOpen(true);

            console.log('Camera started');

            // Continuously decode frames from the live video feed
            scannerControlsRef.current = await codeReaderRef.current.decodeFromVideoElement(
                videoRef.current,
                (result, error) => {
                    if (result) {
                        setSerialNumber(result.getText());
                        console.log('Scanned:', result.getText());

                        // Got a hit — stop scanning and close the camera automatically
                        stopScanning();
                        closeCamera();
                    }
                    // A "not found" error fires continuously while no code is in
                    // frame — that's normal, so it's ignored here rather than logged.
                }
            );
        } catch (error) {
            console.error('Camera error:', error);
            alert('Unable to access the camera.');
        }
    };

    const closeCamera = () => {
        stopScanning();

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
            stopScanning();
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
                muted
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
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
            />

            <br />

            <button type="button">
                Search
            </button>

        </div >
        </>
    );
}

export default App;